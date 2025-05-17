"use server"

import { createPost, voteOnPost } from "@/lib/api"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createNotification } from "@/app/actions/notifications"
import { createServerClient } from "@/lib/supabase"
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
    revalidatePath(`/category/${post.category_id}`)
    redirect(`/post/${post.slug}`)
  } catch (error: any) {
    return { error: error.message || "Failed to create post" }
  }
}

export async function createPostWithTags(formData: FormData) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to create a post" }
  }

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const categoryId = formData.get("category") as string
  const tagsJson = formData.get("tags") as string

  if (!title || !content || !categoryId) {
    return { error: "All fields are required" }
  }

  try {
    // Create the post
    const post = await createPost(title, content, categoryId, user.id)

    // Add tags if provided
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

    // Process mentions
    const mentions = extractMentions(content)
    if (mentions.length > 0) {
      const supabase = createServerClient()

      // Get all mentioned users
      const { data: mentionedUsers } = await supabase.from("profiles").select("id, username").in("username", mentions)

      // Create notifications for mentioned users
      if (mentionedUsers) {
        for (const mentionedUser of mentionedUsers) {
          if (mentionedUser.id !== user.id) {
            // Don't notify yourself
            await createNotification(
              mentionedUser.id,
              `${user.name} mentioned you in a post: "${title}"`,
              `/post/${post.slug}`,
              "mention",
            )
          }
        }
      }
    }

    revalidatePath("/")
    revalidatePath(`/category/${post.category_id}`)
    redirect(`/post/${post.slug}`)
  } catch (error: any) {
    return { error: error.message || "Failed to create post" }
  }
}

export async function votePost(postId: string, voteType: 1 | -1) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to vote" }
  }

  try {
    const totalVotes = await voteOnPost(postId, user.id, voteType)

    // Get post author to notify them about the vote
    const supabase = createServerClient()
    const { data: post } = await supabase.from("posts").select("author_id, title, slug").eq("id", postId).single()

    // Only notify for upvotes and if the author is not the voter
    if (post && post.author_id !== user.id && voteType === 1) {
      await createNotification(
        post.author_id,
        `${user.name} upvoted your post: "${post.title}"`,
        `/post/${post.slug}`,
        "vote",
      )
    }

    revalidatePath("/")
    return { success: true, totalVotes }
  } catch (error: any) {
    return { error: error.message || "Failed to vote" }
  }
}
