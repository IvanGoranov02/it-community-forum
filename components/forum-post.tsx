"use client"

import type React from "react"
import { useState } from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Eye, MessageSquare, Flame, ThumbsUp } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { ProfilePopup } from "@/components/ProfilePopup"

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
  const [profilePopupOpen, setProfilePopupOpen] = useState(false)

  const handleCardClick = (e: React.MouseEvent) => {
    if (profilePopupOpen) return // Prevent navigation if popup is open
    if (!(e.target as HTMLElement).closest("a")) {
      router.push(`/post/${slug}`)
    }
  }

  return (
    <Card
      className="transition-all hover:shadow-md cursor-pointer border-l-4 border-l-primary/70 hover:border-l-primary"
      onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <ProfilePopup username={author} open={profilePopupOpen} setOpen={setProfilePopupOpen}>
            <span onClick={e => e.stopPropagation()}>
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={`/abstract-geometric-shapes.png?height=40&width=40&query=${author}`} alt={author} />
                <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </span>
          </ProfilePopup>
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg hover:text-primary transition-colors">{title}</h3>
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
              <ProfilePopup username={author} open={profilePopupOpen} setOpen={setProfilePopupOpen}>
                <span className="hover:underline hover:text-primary cursor-pointer" onClick={e => e.stopPropagation()}>
                  by {author}
                </span>
              </ProfilePopup>
              <span>•</span>
              <Link href={`/category/${categoryId}`} onClick={(e) => e.stopPropagation()}>
                <Badge variant="secondary" className="hover:bg-secondary/80">
                  {category}
                </Badge>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground p-4 pt-0 bg-muted/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4 text-primary/70" />
            <span>{votes} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-primary/70" />
            <span>{replies} replies</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4 text-primary/70" />
            <span>{views} views</span>
          </div>
        </div>
        <span>{formatDate(timestamp)}</span>
      </CardFooter>
    </Card>
  )
}
