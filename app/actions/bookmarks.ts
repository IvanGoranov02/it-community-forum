"use server"

import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import { createNotification } from "@/app/actions/notifications"

export async function toggleBookmark(postId: string) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to bookmark posts" }
  }

  const supabase = createServerClient()

  // Check if bookmark already exists
  const { data: existingBookmark, error: checkError } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (checkError) {
    return { error: "Error checking bookmark status" }
  }

  if (existingBookmark) {
    // Remove bookmark
    const { error: deleteError } = await supabase.from("bookmarks").delete().eq("id", existingBookmark.id)

    if (deleteError) {
      return { error: "Failed to remove bookmark" }
    }

    revalidatePath("/bookmarks")
    return { success: true, bookmarked: false }
  } else {
    // Add bookmark
    const { error: insertError } = await supabase.from("bookmarks").insert({
      post_id: postId,
      user_id: user.id,
    })

    if (insertError) {
      return { error: "Failed to add bookmark" }
    }

    // Get post author to notify them about the bookmark
    const { data: post } = await supabase.from("posts").select("author_id, title, slug").eq("id", postId).single()

    // Only notify if the author is not the one bookmarking
    if (post && post.author_id !== user.id) {
      await createNotification(
        post.author_id,
        `${user.name} bookmarked your post: "${post.title}"`,
        `/post/${post.slug}`,
        "bookmark",
      )
    }

    revalidatePath("/bookmarks")
    return { success: true, bookmarked: true }
  }
}

export async function getBookmarkedPosts() {
  const user = await getUser()

  if (!user) {
    return []
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      post_id,
      created_at,
      post:posts(
        *,
        author:profiles(*),
        category:categories(*),
        comments:comments(count)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching bookmarks:", error)
    return []
  }

  return data.map((bookmark) => ({
    ...bookmark.post,
    bookmarked_at: bookmark.created_at,
  }))
}

export async function isPostBookmarked(postId: string) {
  const user = await getUser()

  if (!user) {
    return false
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error checking bookmark status:", error)
    return false
  }

  return !!data
}
