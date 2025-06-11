"use server"

import { createComment } from "@/lib/api"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/app/actions/notifications"
import { createServerClient } from "@/lib/supabase"
import { extractMentions } from "@/lib/utils"

export async function createNewComment(formData: FormData) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to comment" }
  }

  const content = formData.get("content") as string
  const postId = formData.get("postId") as string
  const parentId = formData.get("parentId") as string | undefined
  const slug = formData.get("slug") as string

  if (!content || !postId) {
    return { error: "Content is required" }
  }

  try {
    const comment = await createComment(content, postId, user.id, parentId)

    // Get post author to notify them
    const supabase = createServerClient()
    const { data: post } = await supabase.from("posts").select("author_id, title").eq("id", postId).single()

    // Don't notify the author if they're commenting on their own post
    if (post && post.author_id !== user.id) {
      await createNotification(
        post.author_id,
        `${user.name} commented on your post: "${post.title}"`,
        `/post/${slug}#comment-${comment.id}`,
        "comment",
      )
    }

    // If this is a reply to another comment, notify that comment's author
    if (parentId) {
      const { data: parentComment } = await supabase
        .from("comments")
        .select("author_id, content")
        .eq("id", parentId)
        .single()

      if (parentComment && parentComment.author_id !== user.id) {
        await createNotification(
          parentComment.author_id,
          `${user.name} replied to your comment`,
          `/post/${slug}#comment-${comment.id}`,
          "comment",
        )
      }
    }

    // Process mentions
    const mentions = extractMentions(content)
    if (mentions.length > 0) {
      // Get all mentioned users
      const { data: mentionedUsers } = await supabase.from("profiles").select("id, username").in("username", mentions)

      // Create notifications for mentioned users
      if (mentionedUsers) {
        for (const mentionedUser of mentionedUsers) {
          if (mentionedUser.id !== user.id && mentionedUser.id !== post?.author_id) {
            // Don't notify yourself or the post author (already notified)
            await createNotification(
              mentionedUser.id,
              `${user.name} mentioned you in a comment`,
              `/post/${slug}#comment-${comment.id}`,
              "mention",
            )
          }
        }
      }
    }

    revalidatePath(`/post/${slug}`)
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to create comment" }
  }
}

// Функция за редактиране на коментар
export async function updateComment(commentId: string, content: string, postSlug: string) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: "You must be logged in to edit a comment" }
    }

    if (!content || content.trim() === "") {
      return { error: "Comment content cannot be empty" }
    }

    const supabase = createServerClient()

    // Проверка дали потребителят е автор на коментара
    const { data: comment, error: commentCheckError } = await supabase
      .from("comments")
      .select("author_id, content, post_id")
      .eq("id", commentId)
      .single()

    if (commentCheckError) {
      console.error("Error checking comment:", commentCheckError)
      return { error: commentCheckError.message }
    }

    if (comment.author_id !== user.id && user.role !== "admin" && user.email !== "i.goranov02@gmail.com") {
      return { error: "You are not authorized to edit this comment" }
    }

    // Проверка дали съдържанието е променено
    const contentChanged = comment.content !== content

    // Актуализиране на коментара
    const { error: updateError } = await supabase
      .from("comments")
      .update({
        content,
        updated_at: new Date().toISOString(),
        is_edited: contentChanged ? true : undefined, // Само ако съдържанието е променено
      })
      .eq("id", commentId)

    if (updateError) {
      console.error("Error updating comment:", updateError)
      return { error: updateError.message }
    }

    // Обработване на споменатите в новото съдържание, ако е променено
    if (contentChanged) {
      const mentions = extractMentions(content)
      if (mentions.length > 0) {
        // Вземаме всички споменати потребители
        const { data: mentionedUsers } = await supabase.from("profiles").select("id, username").in("username", mentions)

        // Вземаме информация за поста за линка към известието
        const { data: post } = await supabase.from("posts").select("slug, title").eq("id", comment.post_id).single()

        // Създаваме известия за споменатите потребители
        if (mentionedUsers && post) {
          for (const mentionedUser of mentionedUsers) {
            if (mentionedUser.id !== user.id) {
              // Не известяваме себе си
              await createNotification(
                mentionedUser.id,
                `${user.name || user.username || "Someone"} mentioned you in an edited comment`,
                `/post/${post.slug}#comment-${commentId}`,
                "mention",
              )
            }
          }
        }
      }
    }

    revalidatePath(`/post/${postSlug}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error in updateComment:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}

// Функция за изтриване на коментар
export async function deleteComment(commentId: string, postSlug: string) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: "You must be logged in to delete a comment" }
    }

    const supabase = createServerClient()

    // Проверка дали потребителят е автор на коментара или админ
    const { data: comment, error: commentCheckError } = await supabase
      .from("comments")
      .select("author_id")
      .eq("id", commentId)
      .single()

    if (commentCheckError) {
      console.error("Error checking comment:", commentCheckError)
      return { error: commentCheckError.message }
    }

    const isAuthor = comment.author_id === user.id
    const isAdmin = user.role === "admin"
    const isSpecialUser = user.email === "i.goranov02@gmail.com"

    if (!isAuthor && !isAdmin && !isSpecialUser) {
      return { error: "You are not authorized to delete this comment" }
    }

    // Изтриване на коментара
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)

    if (deleteError) {
      console.error("Error deleting comment:", deleteError)
      return { error: deleteError.message }
    }

    revalidatePath(`/post/${postSlug}`)
    return { success: true }
  } catch (error: any) {
    console.error("Error in deleteComment:", error)
    return { error: error.message || "An unexpected error occurred" }
  }
}
