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

export async function deleteComment(commentId: string) {
  const user = await getUser();

  if (!user) {
    return { error: "You must be logged in to delete a comment" };
  }

  try {
    const supabase = createServerClient();

    // Check if the comment exists and get its author
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("author_id, post_id")
      .eq("id", commentId)
      .single();

    if (commentError) {
      console.error("Error fetching comment:", commentError);
      return { error: "Comment not found" };
    }

    // Check if user is authorized to delete (author, admin, or specific email)
    const isAuthor = comment.author_id === user.id;
    const isAdmin = user.role === "admin";
    const isSpecialUser = user.email === "i.goranov02@gmail.com";

    if (!isAuthor && !isAdmin && !isSpecialUser) {
      return { error: "You don't have permission to delete this comment" };
    }

    // Delete the comment
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Error deleting comment:", deleteError);
      return { error: "Failed to delete comment" };
    }

    // Get the post slug for revalidation
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("slug")
      .eq("id", comment.post_id)
      .single();

    if (!postError && post) {
      revalidatePath(`/post/${post.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteComment:", error);
    return { error: "An unexpected error occurred" };
  }
}
