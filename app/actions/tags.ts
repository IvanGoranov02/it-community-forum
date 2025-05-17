"use server"

import { createServerClient } from "@/lib/supabase"

export async function getTags() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("tags").select("*").order("name")

  if (error) {
    console.error("Error fetching tags:", error)
    return []
  }

  return data
}

export async function getTagBySlug(slug: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("tags").select("*").eq("slug", slug).single()

  if (error) {
    console.error(`Error fetching tag with slug ${slug}:`, error)
    return null
  }

  return data
}

export async function getPostsByTag(tagId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("post_tags")
    .select(`
      post_id,
      post:posts(
        *,
        author:profiles(*),
        category:categories(*),
        comments:comments(count)
      )
    `)
    .eq("tag_id", tagId)

  if (error) {
    console.error(`Error fetching posts for tag ${tagId}:`, error)
    return []
  }

  // Calculate total votes for each post
  const postsWithVotes = await Promise.all(
    data.map(async (item) => {
      const post = item.post
      const { data: votesData, error: votesError } = await supabase
        .from("post_votes")
        .select("vote_type")
        .eq("post_id", post.id)

      if (votesError) {
        console.error(`Error fetching votes for post ${post.id}:`, votesError)
        return { ...post, total_votes: 0 }
      }

      const totalVotes = votesData.reduce((sum, vote) => sum + vote.vote_type, 0)

      return { ...post, total_votes: totalVotes }
    }),
  )

  return postsWithVotes
}

export async function getPostTags(postId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("post_tags")
    .select(`
      tag:tags(*)
    `)
    .eq("post_id", postId)

  if (error) {
    console.error(`Error fetching tags for post ${postId}:`, error)
    return []
  }

  return data.map((item) => item.tag)
}

export async function addTagToPost(postId: string, tagId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("post_tags").insert({
    post_id: postId,
    tag_id: tagId,
  })

  if (error) {
    console.error(`Error adding tag ${tagId} to post ${postId}:`, error)
    return false
  }

  return true
}
