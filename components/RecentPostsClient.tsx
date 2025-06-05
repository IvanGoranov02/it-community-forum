"use client"
import { useEffect, useState } from "react"
import { ForumPost } from "./forum-post"
import { Card, CardContent } from "./ui/card"

// Тип за пост, използван в списъка
interface ForumPostListItem {
  id: string
  title: string
  author: {
    id: string
    username: string
    avatar_url?: string | null
  }
  authorId: string
  category: {
    id: string
    name: string
  }
  categoryId: string
  replies: number
  views: number
  votes: number
  created_at: string
  slug: string
  comments?: { count: number }[]
  total_votes: number
}

interface RecentPostsClientProps {
  initialPosts: ForumPostListItem[]
}

export default function RecentPostsClient({ initialPosts }: RecentPostsClientProps) {
  const [localRecentPosts, setLocalRecentPosts] = useState<ForumPostListItem[]>(initialPosts)

  useEffect(() => {
    // Listen for local-first new post event
    const handler = (e: CustomEvent<ForumPostListItem>) => {
      setLocalRecentPosts((prev) => [e.detail, ...prev])
    }
    window.addEventListener('new-post-local', handler as EventListener)
    return () => window.removeEventListener('new-post-local', handler as EventListener)
  }, [])

  return (
    <div className="grid gap-4">
      {localRecentPosts.map((post) => (
        <ForumPost
          key={post.id}
          id={post.id}
          title={post.title}
          author={post.author.username}
          authorId={post.author.id}
          category={post.category.name}
          categoryId={post.category.id}
          replies={post.comments?.[0]?.count || 0}
          views={post.views}
          votes={post.total_votes}
          timestamp={post.created_at}
          slug={post.slug}
          isHot={post.total_votes > 10 || post.views > 100}
        />
      ))}
      {localRecentPosts.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No posts yet. Be the first to create a post!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 