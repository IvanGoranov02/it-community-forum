"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { useState } from "react"
import { toggleBookmark } from "@/app/actions/bookmarks"
import { useToast } from "@/hooks/use-toast"

interface BookmarkButtonProps {
  postId: string
  initialBookmarked: boolean
}

export function BookmarkButton({ postId, initialBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggleBookmark = async () => {
    setIsLoading(true)
    const result = await toggleBookmark(postId)
    setIsLoading(false)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result.success) {
      setIsBookmarked(result.bookmarked)
      toast({
        title: result.bookmarked ? "Post bookmarked" : "Bookmark removed",
        description: result.bookmarked
          ? "This post has been added to your bookmarks"
          : "This post has been removed from your bookmarks",
      })
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleBookmark}
      disabled={isLoading}
      title={isBookmarked ? "Remove bookmark" : "Bookmark this post"}
    >
      <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
    </Button>
  )
}
