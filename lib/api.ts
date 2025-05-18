import { createServerClient } from "@/lib/supabase"
import { slugify } from "@/lib/utils"
import { cache } from "react"

// Categories
export const getCategories = cache(async () => {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data
})

export const getCategoryBySlug = cache(async (slug: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single()

  if (error) {
    console.error(`Error fetching category with slug ${slug}:`, error)
    return null
  }

  return data
})

// Posts
export const getRecentPosts = cache(async (limit = 10) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      comments:comments(count),
      votes:post_votes(count)
    `)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recent posts:", error)
    return []
  }

  // Calculate total votes
  const postsWithVotes = await Promise.all(
    data.map(async (post) => {
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
})

export const getPopularPosts = cache(async (limit = 10) => {
  const supabase = createServerClient()

  // First get all posts with their metadata
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      comments:comments(count),
      votes:post_votes(count)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching posts for popularity calculation:", error)
    return []
  }

  // Calculate popularity score for each post
  const postsWithPopularity = await Promise.all(
    data.map(async (post) => {
      // Get votes
      const { data: votesData, error: votesError } = await supabase
        .from("post_votes")
        .select("vote_type")
        .eq("post_id", post.id)

      if (votesError) {
        console.error(`Error fetching votes for post ${post.id}:`, votesError)
        return { ...post, total_votes: 0, popularity_score: 0 }
      }

      const totalVotes = votesData.reduce((sum, vote) => sum + vote.vote_type, 0)

      // Calculate popularity score (votes + views + comments * 2)
      const popularityScore = totalVotes + post.views * 0.1 + (post.comments?.[0]?.count || 0) * 2

      return {
        ...post,
        total_votes: totalVotes,
        popularity_score: popularityScore,
      }
    }),
  )

  // Sort by popularity score and return top N
  return postsWithPopularity.sort((a, b) => b.popularity_score - a.popularity_score).slice(0, limit)
})

export const getPostsByCategory = cache(async (categoryId: string, limit = 20) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      comments:comments(count),
      votes:post_votes(count)
    `)
    .eq("category_id", categoryId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`Error fetching posts for category ${categoryId}:`, error)
    return []
  }

  // Calculate total votes
  const postsWithVotes = await Promise.all(
    data.map(async (post) => {
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
})

export const getPostBySlug = cache(async (slug: string) => {
  const supabase = createServerClient()

  // Increment view count
  await supabase.rpc("increment_post_view", { post_slug: slug })

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*),
      category:categories(*)
    `)
    .eq("slug", slug)
    .single()

  if (error) {
    console.error(`Error fetching post with slug ${slug}:`, error)
    return null
  }

  // Get votes
  const { data: votesData, error: votesError } = await supabase
    .from("post_votes")
    .select("vote_type")
    .eq("post_id", data.id)

  if (votesError) {
    console.error(`Error fetching votes for post ${data.id}:`, votesError)
    return { ...data, total_votes: 0 }
  }

  const totalVotes = votesData.reduce((sum, vote) => sum + vote.vote_type, 0)

  return { ...data, total_votes: totalVotes }
})

export const createPost = async (title: string, content: string, categoryId: string, authorId: string) => {
  const supabase = createServerClient()

  const slug = slugify(title)

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      slug,
      content,
      category_id: categoryId,
      author_id: authorId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating post:", error)
    throw new Error(error.message)
  }

  return data
}

// Comments
export const getCommentsByPostId = cache(async (postId: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      author:profiles(*),
      votes:comment_votes(count),
      replies:comments(
        *,
        author:profiles(*)
      )
    `)
    .eq("post_id", postId)
    .is("parent_id", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching comments for post ${postId}:`, error)
    return []
  }

  // Calculate total votes for each comment
  const commentsWithVotes = await Promise.all(
    data.map(async (comment) => {
      const { data: votesData, error: votesError } = await supabase
        .from("comment_votes")
        .select("vote_type")
        .eq("comment_id", comment.id)

      if (votesError) {
        console.error(`Error fetching votes for comment ${comment.id}:`, votesError)
        return { ...comment, total_votes: 0 }
      }

      const totalVotes = votesData.reduce((sum, vote) => sum + vote.vote_type, 0)

      // Also calculate votes for replies
      const repliesWithVotes = await Promise.all(
        (comment.replies || []).map(async (reply) => {
          const { data: replyVotesData, error: replyVotesError } = await supabase
            .from("comment_votes")
            .select("vote_type")
            .eq("comment_id", reply.id)

          if (replyVotesError) {
            console.error(`Error fetching votes for reply ${reply.id}:`, replyVotesError)
            return { ...reply, total_votes: 0 }
          }

          const replyTotalVotes = replyVotesData.reduce((sum, vote) => sum + vote.vote_type, 0)

          return { ...reply, total_votes: replyTotalVotes }
        }),
      )

      return {
        ...comment,
        total_votes: totalVotes,
        replies: repliesWithVotes,
      }
    }),
  )

  return commentsWithVotes
})

export const createComment = async (content: string, postId: string, authorId: string, parentId?: string) => {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("comments")
    .insert({
      content,
      post_id: postId,
      author_id: authorId,
      parent_id: parentId || null,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating comment:", error)
    throw new Error(error.message)
  }

  return data
}

// Votes
export const voteOnPost = async (postId: string, userId: string, voteType: 1 | -1) => {
  const supabase = createServerClient()

  // Check if user already voted
  const { data: existingVote, error: checkError } = await supabase
    .from("post_votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking existing vote:", checkError)
    throw new Error(checkError.message)
  }

  if (existingVote) {
    // Update existing vote
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking the same button
      const { error: deleteError } = await supabase.from("post_votes").delete().eq("id", existingVote.id)

      if (deleteError) {
        console.error("Error removing vote:", deleteError)
        throw new Error(deleteError.message)
      }
    } else {
      // Change vote type
      const { error: updateError } = await supabase
        .from("post_votes")
        .update({ vote_type: voteType })
        .eq("id", existingVote.id)

      if (updateError) {
        console.error("Error updating vote:", updateError)
        throw new Error(updateError.message)
      }
    }
  } else {
    // Create new vote
    const { error: insertError } = await supabase.from("post_votes").insert({
      post_id: postId,
      user_id: userId,
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

  return votesData.reduce((sum, vote) => sum + vote.vote_type, 0)
}

// Search
// Проверка на функцията за търсене в API
// Нека подобрим функцията за търсене, за да работи по-добре

// Функцията searchPosts остава същата, но нека я прегледаме
export const searchPosts = async (query: string, limit = 20) => {
  const supabase = createServerClient()

  console.log("Searching posts with query:", query)

  // Използваме ilike за case-insensitive търсене и % за частично съвпадение
  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      comments:comments(count)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error searching posts:", error)
    return []
  }

  console.log(`Found ${data.length} results for query: ${query}`)
  return data
}
