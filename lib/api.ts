import { createServerClient } from "@/lib/supabase"
import { slugify } from "@/lib/utils"
import { cache } from "react"

// Categories
export const getCategories = cache(async () => {
  const supabase = createServerClient()

  // Първо извличаме всички категории
  const { data: categories, error } = await supabase.from("categories").select("*").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  // След това извличаме броя на постовете за всяка категория
  const categoriesWithCounts = await Promise.all(
    categories.map(async (category) => {
      try {
        // Извличаме броя на постовете за тази категория
        const { data: posts, error: postError } = await supabase
          .from("posts")
          .select("id, author_id")
          .eq("category_id", category.id)

        if (postError) {
          console.error(`Error fetching posts for category ${category.id}:`, postError)
          return { ...category, postCount: 0, userCount: 0 }
        }

        // Изчисляваме броя на постовете
        const postCount = posts.length

        // Изчисляваме броя на уникалните потребители
        const uniqueUsers = new Set(posts.map((post) => post.author_id))
        const userCount = uniqueUsers.size

        console.log(`Category ${category.name}: ${postCount} posts, ${userCount} users`)

        return {
          ...category,
          postCount,
          userCount,
        }
      } catch (error) {
        console.error(`Error processing category ${category.id}:`, error)
        return { ...category, postCount: 0, userCount: 0 }
      }
    }),
  )

  return categoriesWithCounts
})

export const getCategoryBySlug = cache(async (slugOrId: string) => {
  const supabase = createServerClient()

  // First try to find by slug
  let { data, error } = await supabase.from("categories").select("*").eq("slug", slugOrId).maybeSingle()

  if (error) {
    console.error(`Error fetching category with slug ${slugOrId}:`, error)
  }

  // If not found by slug, try to find by id
  if (!data) {
    const { data: dataById, error: errorById } = await supabase
      .from("categories")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle()

    if (errorById) {
      console.error(`Error fetching category with id ${slugOrId}:`, errorById)
      return null
    }

    data = dataById
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
    // Temporarily remove is_archived filter until the column exists
    // .eq("is_archived", false)
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
    // Temporarily remove is_archived filter until the column exists
    // .eq("is_archived", false)
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
    // Temporarily remove is_archived filter until the column exists
    // .eq("is_archived", false)
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

  try {
    // Increment view count - only if the post exists
    const { data: checkPost, error: checkError } = await supabase
      .from("posts")
      .select("id")
      .eq("slug", slug)
      .maybeSingle()

    if (checkError) {
      console.error(`Error checking post with slug ${slug}:`, checkError)
      return null
    }

    if (checkPost) {
      await supabase.rpc("increment_post_view", { post_slug: slug })
    } else {
      console.error(`Post with slug ${slug} not found`)
      return null
    }

    // Get post with author and category
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        author:profiles(*),
        category:categories(*)
      `)
      .eq("slug", slug)
      .maybeSingle()

    if (error) {
      console.error(`Error fetching post with slug ${slug}:`, error)
      return null
    }

    if (!data) {
      console.error(`Post with slug ${slug} not found`)
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
  } catch (error) {
    console.error(`Unexpected error fetching post with slug ${slug}:`, error)
    return null
  }
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
    // Temporarily remove is_archived filter until the column exists
    // .eq("is_archived", false)
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

// Get user posts
export const getUserPosts = cache(async (userId: string, limit = 50) => {
  const supabase = createServerClient()

  console.log("Fetching posts for user:", userId)

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      comments:comments(count)
    `)
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error(`Error fetching posts for user ${userId}:`, error)
    return []
  }

  console.log(`Found ${data.length} posts for user ${userId}`)

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
