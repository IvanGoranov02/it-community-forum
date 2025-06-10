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
  const [userVote, setUserVote] = useState<1 | -1 | 0>(0) // 1 for upvote, -1 for downvote, 0 for no vote
  const { toast } = useToast()

  const handleVote = async (voteType: 1 | -1) => {
    setIsLoading(true)

    // If user clicks the same vote button again, we'll remove their vote
    const newVoteType = userVote === voteType ? 0 : voteType

    const result = await votePost(postId, newVoteType)
    setIsLoading(false)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else if (result.success) {
      setVotes(result.totalVotes)
      setUserVote(newVoteType)

      if (newVoteType !== 0) {
        toast({
          title: newVoteType === 1 ? "Upvoted" : "Downvoted",
          description: "Your vote has been recorded",
        })
      } else {
        toast({
          title: "Vote removed",
          description: "Your vote has been removed",
        })
      }
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-1 ${userVote === 1 ? "text-green-600 dark:text-green-400" : ""}`}
        onClick={() => handleVote(1)}
        disabled={isLoading}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <span
        className={`text-sm font-medium ${votes > 0 ? "text-green-600 dark:text-green-400" : votes < 0 ? "text-red-600 dark:text-red-400" : ""}`}
      >
        {votes}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-1 ${userVote === -1 ? "text-red-600 dark:text-red-400" : ""}`}
        onClick={() => handleVote(-1)}
        disabled={isLoading}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  )
}
