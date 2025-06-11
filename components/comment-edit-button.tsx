"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit2 } from "lucide-react"
import { updateComment } from "@/app/actions/comments"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CommentEditButtonProps {
  commentId: string
  postSlug: string
  isAuthor: boolean
  userEmail?: string
  initialContent: string
}

export function CommentEditButton({ commentId, postSlug, isAuthor, userEmail, initialContent }: CommentEditButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState(initialContent)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const canEdit = isAuthor || userEmail === "i.goranov02@gmail.com"

  if (!canEdit) {
    return null
  }

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Comment content cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updateComment(commentId, content, postSlug)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Comment updated successfully",
      })
      setIsOpen(false)
    } catch (error) {
      console.error("Error updating comment:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Edit2 className="h-4 w-4" />
          <span>Edit</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogDescription>
            Make changes to your comment. Use @username to mention users.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Edit your comment..."
            className="min-h-[150px]"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 