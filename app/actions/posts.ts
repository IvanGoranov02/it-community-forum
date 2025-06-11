"use server"

import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { slugify } from "@/lib/utils"
import { createNotification } from "@/app/actions/notifications"
import { addTagToPost } from "@/app/actions/tags"
import { extractMentions } from "@/lib/utils"

export async function createNewPost(formData: FormData) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to create a post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const categoryId = formData.get("category") as string

  if (!title || !content || !categoryId) {
    return { error: "All fields are required" }
  }

  try {
    const post = await createPost(title, content, categoryId, user.id)
    revalidatePath("/")
    revalidatePath(`/category/${categoryId}`)
    redirect(`/post/${post.slug}`)
  } catch (error: any) {
    return { error: error.message || "Failed to create post" }
  }
}

export async function createPostWithTags(formData: FormData) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: "Трябва да сте влезли в профила си, за да създадете пост" }
    }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const categoryId = formData.get("category") as string
    const tagsJson = formData.get("tags") as string

    if (!title || !content || !categoryId) {
      return { error: "Всички полета са задължителни" }
    }

    // Създаваме slug от заглавието
    const baseSlug = slugify(title)
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`

    // Създаваме поста
    const supabase = createServerClient()

    // Проверяваме дали категорията съществува
    const { data: categoryCheck, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .single()

    if (categoryError || !categoryCheck) {
      console.error("Error checking category:", categoryError)
      return { error: "Избраната категория не съществува" }
    }

    // Вмъкваме поста директно - премахваме is_archived полето
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        category_id: categoryId,
        author_id: user.id,
        slug: uniqueSlug,
        // Премахваме is_archived: false, тъй като колоната не съществува
      })
      .select()
      .single()

    if (postError || !post) {
      console.error("Error creating post:", postError)
      return { error: postError?.message || "Грешка при създаването на поста" }
    }

    // Добавяме тагове, ако са предоставени
    if (tagsJson) {
      try {
        const tagIds = JSON.parse(tagsJson) as string[]
        for (const tagId of tagIds) {
          await addTagToPost(post.id, tagId)
        }
      } catch (e) {
        console.error("Error parsing tags:", e)
      }
    }

    // Обработваме споменатите потребители
    const mentions = extractMentions(content)
    if (mentions.length > 0) {
      // Вземаме всички споменати потребители
      const { data: mentionedUsers } = await supabase.from("profiles").select("id, username").in("username", mentions)

      // Създаваме известия за споменатите потребители
      if (mentionedUsers) {
        for (const mentionedUser of mentionedUsers) {
          if (mentionedUser.id !== user.id) {
            // Не известяваме себе си
            await createNotification(
              mentionedUser.id,
              `${user.name || user.username} ви спомена в пост: "${title}"`,
              `/post/${post.slug}`,
              "mention",
            )
          }
        }
      }
    }

    revalidatePath("/")
    revalidatePath(`/category/${categoryId}`)
    revalidatePath("/my-posts")

    return { success: true, slug: post.slug }
  } catch (error: any) {
    console.error("Error in createPostWithTags:", error)
    return { error: error.message || "Грешка при създаването на поста" }
  }
}

// Останалата част от файла остава непроменена
export async function createPost(formData: FormData) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to create a post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const categoryId = formData.get("category") as string
  const tagsJson = formData.get("tags") as string
  let tags: string[] = []

  try {
    tags = JSON.parse(tagsJson || "[]")
  } catch (error) {
    console.error("Error parsing tags:", error)
  }

  if (!title || !content || !categoryId) {
    return { error: "Title, content, and category are required" }
  }

  const supabase = createServerClient()
  const slug = slugify(title)

  try {
    // Create post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .insert({
        title,
        content,
        slug,
        category_id: categoryId,
        author_id: user.id,
      })
      .select()
      .single()

    if (postError) {
      console.error("Error creating post:", postError)
      return { error: postError.message }
    }

    // Add tags if any
    if (tags.length > 0) {
      const tagInserts = tags.map((tagId) => ({
        post_id: post.id,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase.from("post_tags").insert(tagInserts)

      if (tagError) {
        console.error("Error adding tags to post:", tagError)
        // We don't return an error here because the post was created successfully
      }
    }

    revalidatePath("/")
    redirect(`/post/${post.slug}`)
  } catch (error) {
    console.error("Error in createPost:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updatePost(formData: FormData) {
  try {
    const user = await getUser()

    if (!user) {
      return { error: "You must be logged in to update a post" }
    }

    const postId = formData.get("postId") as string
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const categoryId = formData.get("category") as string
    const tagsJson = formData.get("tags") as string
    let tags: string[] = []

    try {
      tags = JSON.parse(tagsJson || "[]")
    } catch (error) {
      console.error("Error parsing tags:", error)
    }

    if (!postId || !title || !content || !categoryId) {
      return { error: "Post ID, title, content, and category are required" }
    }

    const supabase = createServerClient()

    // Check if user is the author
    const { data: post, error: postCheckError } = await supabase
      .from("posts")
      .select("author_id, slug, title, content, category_id")
      .eq("id", postId)
      .single()

    if (postCheckError) {
      console.error("Error checking post:", postCheckError)
      return { error: postCheckError.message }
    }

    if (post.author_id !== user.id) {
      return { error: "You are not authorized to update this post" }
    }

    // Check if the content actually changed
    const contentChanged = post.content !== content || post.title !== title || post.category_id !== categoryId

    // Update post
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title,
        content,
        category_id: categoryId,
        updated_at: new Date().toISOString(),
        is_edited: contentChanged ? true : undefined, // Only set is_edited if content changed
      })
      .eq("id", postId)

    if (updateError) {
      console.error("Error updating post:", updateError)
      return { error: updateError.message }
    }

    // Update tags
    // First, remove all existing tags
    const { error: deleteTagsError } = await supabase.from("post_tags").delete().eq("post_id", postId)

    if (deleteTagsError) {
      console.error("Error removing existing tags:", deleteTagsError)
      // We don't return an error here because the post was updated successfully
    }

    // Then, add new tags
    if (tags.length > 0) {
      const tagInserts = tags.map((tagId) => ({
        post_id: postId,
        tag_id: tagId,
      }))

      const { error: tagError } = await supabase.from("post_tags").insert(tagInserts)

      if (tagError) {
        console.error("Error adding tags to post:", tagError)
        // We don't return an error here because the post was updated successfully
      }
    }

    // Process mentions
    if (contentChanged) {
      const mentions = extractMentions(content)
      if (mentions.length > 0) {
        // Get all mentioned users
        const { data: mentionedUsers } = await supabase.from("profiles").select("id, username").in("username", mentions)

        // Create notifications for mentioned users
        if (mentionedUsers) {
          for (const mentionedUser of mentionedUsers) {
            if (mentionedUser.id !== user.id) {
              // Don't notify yourself
              await createNotification(
                mentionedUser.id,
                `${user.name || "Someone"} mentioned you in an updated post: "${title}"`,
                `/post/${post.slug}`,
                "mention",
              )
            }
          }
        }
      }
    }

    // Revalidate paths
    revalidatePath(`/post/${post.slug}`)
    revalidatePath("/my-posts")
    revalidatePath("/")

    // Return success instead of redirecting
    return { success: true, slug: post.slug }
  } catch (error) {
    console.error("Error in updatePost:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function deletePost(postId: string) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to delete a post" }
  }

  const supabase = createServerClient()

  try {
    // Check if user is the author
    const { data: post, error: postCheckError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single()

    if (postCheckError) {
      console.error("Error checking post:", postCheckError)
      return { error: postCheckError.message }
    }

    if (post.author_id !== user.id) {
      return { error: "You are not authorized to delete this post" }
    }

    // Delete post
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

    if (deleteError) {
      console.error("Error deleting post:", deleteError)
      return { error: deleteError.message }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error in deletePost:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function archivePost(postId: string) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to archive a post" }
  }

  const supabase = createServerClient()

  try {
    // Check if user is the author
    const { data: post, error: postCheckError } = await supabase
      .from("posts")
      .select("author_id, slug")
      .eq("id", postId)
      .single()

    if (postCheckError) {
      console.error("Error checking post:", postCheckError)
      return { error: postCheckError.message }
    }

    if (post.author_id !== user.id) {
      return { error: "You are not authorized to archive this post" }
    }

    // Проверяваме дали колоната is_archived съществува
    const { data: columnExists, error: columnError } = await supabase.rpc("column_exists", {
      table_name: "posts",
      column_name: "is_archived",
    })

    if (columnError) {
      console.error("Error checking if is_archived column exists:", columnError)
      return { error: "Не може да се архивира поста в момента" }
    }

    if (!columnExists) {
      console.error("is_archived column does not exist")
      return { error: "Функцията за архивиране не е налична в момента" }
    }

    // Archive post
    const { error: archiveError } = await supabase.from("posts").update({ is_archived: true }).eq("id", postId)

    if (archiveError) {
      console.error("Error archiving post:", archiveError)
      return { error: archiveError.message }
    }

    revalidatePath(`/post/${post.slug}`)
    revalidatePath("/my-posts")
    return { success: true }
  } catch (error) {
    console.error("Error in archivePost:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function unarchivePost(postId: string) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to unarchive a post" }
  }

  const supabase = createServerClient()

  try {
    // Check if user is the author
    const { data: post, error: postCheckError } = await supabase
      .from("posts")
      .select("author_id, slug")
      .eq("id", postId)
      .single()

    if (postCheckError) {
      console.error("Error checking post:", postCheckError)
      return { error: postCheckError.message }
    }

    if (post.author_id !== user.id) {
      return { error: "You are not authorized to unarchive this post" }
    }

    // Проверяваме дали колоната is_archived съществува
    const { data: columnExists, error: columnError } = await supabase.rpc("column_exists", {
      table_name: "posts",
      column_name: "is_archived",
    })

    if (columnError) {
      console.error("Error checking if is_archived column exists:", columnError)
      return { error: "Не може да се разархивира поста в момента" }
    }

    if (!columnExists) {
      console.error("is_archived column does not exist")
      return { error: "Функцията за разархивиране не е налична в момента" }
    }

    // Unarchive post
    const { error: unarchiveError } = await supabase.from("posts").update({ is_archived: false }).eq("id", postId)

    if (unarchiveError) {
      console.error("Error unarchiving post:", unarchiveError)
      return { error: unarchiveError.message }
    }

    revalidatePath(`/post/${post.slug}`)
    revalidatePath("/my-posts")
    return { success: true }
  } catch (error) {
    console.error("Error in unarchivePost:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function votePost(postId: string, voteType: 1 | -1 | 0) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to vote" }
  }

  try {
    const supabase = createServerClient()

    // Check if user already voted
    const { data: existingVote, error: checkError } = await supabase
      .from("post_votes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking existing vote:", checkError)
      throw new Error(checkError.message)
    }

    // If voteType is 0, remove the vote
    if (voteType === 0 && existingVote) {
      const { error: deleteError } = await supabase.from("post_votes").delete().eq("id", existingVote.id)

      if (deleteError) {
        console.error("Error removing vote:", deleteError)
        throw new Error(deleteError.message)
      }
    } else if (existingVote) {
      // Update existing vote
      const { error: updateError } = await supabase
        .from("post_votes")
        .update({ vote_type: voteType })
        .eq("id", existingVote.id)

      if (updateError) {
        console.error("Error updating vote:", updateError)
        throw new Error(updateError.message)
      }
    } else if (voteType !== 0) {
      // Create new vote
      const { error: insertError } = await supabase.from("post_votes").insert({
        post_id: postId,
        user_id: user.id,
        vote_type: voteType,
      })

      if (insertError) {
        console.error("Error creating vote:", insertError)
        throw new Error(insertError.message)
      }
    }

    // Get updated vote count
    const { data: votesData, error: votesError } = await supabase
      .from("post_votes")
      .select("vote_type")
      .eq("post_id", postId)

    if (votesError) {
      console.error("Error fetching updated votes:", votesError)
      throw new Error(votesError.message)
    }

    const totalVotes = votesData.reduce((sum, vote) => sum + vote.vote_type, 0)

    // Get post author to notify them about the vote
    if (voteType === 1) {
      const { data: post } = await supabase.from("posts").select("author_id, title, slug").eq("id", postId).single()

      // Only notify for upvotes and if the author is not the voter
      if (post && post.author_id !== user.id) {
        await createNotification(
          post.author_id,
          `${user.name} upvoted your post: "${post.title}"`,
          `/post/${post.slug}`,
          "vote",
        )
      }
    }

    revalidatePath("/")
    return { success: true, totalVotes }
  } catch (error: any) {
    return { error: error.message || "Failed to vote" }
  }
}
