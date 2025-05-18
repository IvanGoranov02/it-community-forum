"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Eye, MessageSquare, Flame, ThumbsUp } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ForumPostProps {
  id: string
  title: string
  author: string
  authorId: string
  category: string
  categoryId: string
  replies: number
  views: number
  votes: number
  timestamp: string
  slug: string
  isHot?: boolean
}

export function ForumPost({
  id,
  title,
  author,
  authorId,
  category,
  categoryId,
  replies,
  views,
  votes,
  timestamp,
  slug,
  isHot = false,
}: ForumPostProps) {
  const router = useRouter()

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click wasn't on a link
    if (!(e.target as HTMLElement).closest("a")) {
      router.push(`/post/${slug}`)
    }
  }

  return (
    <Card className="transition-all hover:shadow-md cursor-pointer" onClick={handleCardClick}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={`/abstract-geometric-shapes.png?height=40&width=40&query=${author}`} alt={author} />
            <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold hover:underline">{title}</h3>
              {isHot && (
                <Badge
                  variant="outline"
                  className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 flex items-center gap-1"
                >
                  <Flame className="h-3 w-3" />
                  Hot
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href={`/profile/${author}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                by {author}
              </Link>
              <span>•</span>
              <Link href={`/category/${categoryId}`} onClick={(e) => e.stopPropagation()}>
                <Badge variant="secondary">{category}</Badge>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground p-4 pt-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{votes} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{replies} replies</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{views} views</span>
          </div>
        </div>
        <span>{formatDate(timestamp)}</span>
      </CardFooter>
    </Card>
  )
}
