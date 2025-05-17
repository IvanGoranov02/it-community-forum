"use client"

import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { useState } from "react"
import { votePost } from "@/app/actions/posts"
import { useToast } from "@/hooks/use-toast"

interface VoteButtonsProps {
  postId: string
  initialVotes: number
}

export function VoteButtons({ postId, initialVotes }: VoteButtonsProps) {
  const [votes, setVotes] = useState(initialVotes)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleVote = async (voteType: 1 | -1) => {
    setIsLoading(true)
    const result = await votePost(postId, voteType)
    setIsLoading(false)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result.success) {
      setVotes(result.totalVotes)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleVote(1)}
        disabled={isLoading}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium">{votes}</span>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => handleVote(-1)}
        disabled={isLoading}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
