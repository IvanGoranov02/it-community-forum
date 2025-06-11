"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare } from "lucide-react"

interface PostReplyButtonProps {
  authorUsername: string
  onReply: (username: string) => void
}

export function PostReplyButton({ authorUsername, onReply }: PostReplyButtonProps) {
  const handleReplyClick = () => {
    onReply(authorUsername)
    document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex items-center gap-1"
      onClick={handleReplyClick}
    >
      <MessageSquare className="h-4 w-4" />
      <span>Reply</span>
    </Button>
  )
} 