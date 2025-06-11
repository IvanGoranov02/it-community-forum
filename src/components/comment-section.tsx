"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Flag, Share2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createNewComment } from "@/app/actions/comments"
import { PostContent } from "@/components/post-content"
import { ReportDialog } from "@/components/report-dialog"
import { ProfilePopup } from "@/components/ProfilePopup"
import Link from "next/link"
import { ShareDialog } from "@/components/share-dialog"

// Компонент за форма за коментар с loading state
function CommentForm({ postId, slug, replyToUsername = null, onCommentSubmitted }: { postId: string; slug: string; replyToUsername?: string | null; onCommentSubmitted?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [commentContent, setCommentContent] = useState(replyToUsername ? `@${replyToUsername} ` : "")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Update comment content when replyToUsername changes
  useEffect(() => {
    if (replyToUsername) {
      setCommentContent(`@${replyToUsername} `)
      // Focus the textarea
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [replyToUsername])

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    try {
      await createNewComment(formData)
      // Reset form after submission
      setCommentContent("")
      // Clear reply state in parent component
      if (onCommentSubmitted) {
        onCommentSubmitted()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4 bg-muted/20 p-6 rounded-lg border">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" />
        {replyToUsername ? `Reply to @${replyToUsername}` : "Add Your Reply"}
      </h3>
      <form action={handleSubmit}>
        <input type="hidden" name="postId" value={postId} />
        <input type="hidden" name="slug" value={slug} />
        <Textarea
          ref={textareaRef}
          name="content"
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="Share your thoughts... Use @username to mention users"
          className="min-h-[150px] focus-visible:ring-primary"
          required
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                Posting...
              </>
            ) : (
              "Post Reply"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Основен компонент за секцията с коментари
export function CommentSection({ comments, postId, slug, user }: any) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  // Функция за изчистване на reply състоянието
  const clearReplyState = () => {
    setReplyingTo(null)
  }

  return (
    <>
      {comments.length > 0 ? (
        comments.map((comment: any) => (
          <Card key={comment.id} id={`comment-${comment.id}`} className="border-l-4 border-l-secondary/70">
            <CardHeader className="flex flex-row items-start gap-4 p-6 bg-muted/20">
              <ProfilePopup username={comment.author?.username}>
                <Avatar className="h-10 w-10 border group-hover:ring-2 group-hover:ring-primary transition">
                  <AvatarImage
                    src={
                      comment.author?.avatar_url ||
                      `/placeholder.svg?height=40&width=40&query=${comment.author?.username || "user"}`
                    }
                    alt={comment.author?.username || "User"}
                  />
                  <AvatarFallback>{comment.author?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </ProfilePopup>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ProfilePopup username={comment.author?.username}>
                    <span className="font-semibold hover:underline hover:text-primary transition-colors cursor-pointer">
                      {comment.author?.username || "Unknown User"}
                    </span>
                  </ProfilePopup>
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  >
                    {comment.author?.role === "admin"
                      ? "Admin"
                      : comment.author?.role === "moderator"
                        ? "Moderator"
                        : "Member"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{formatDate(comment.created_at)}</p>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4">
              <div className="prose dark:prose-invert max-w-none">
                <PostContent content={comment.content} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-6 border-t bg-muted/10">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => {
                    setReplyingTo(comment.author?.username || null)
                    // Scroll to comment form
                    document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Reply</span>
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <ShareDialog url={`/post/${slug}#comment-${comment.id}`} title="Share this comment">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </ShareDialog>
                <ReportDialog contentType="comment" contentId={comment.id}>
                  <Button variant="ghost" size="icon">
                    <Flag className="h-4 w-4" />
                  </Button>
                </ReportDialog>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <Card className="border border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
          </CardContent>
        </Card>
      )}

      <Separator className="my-4" />

      <div id="comment-form">
        {user ? (
          <CommentForm 
            postId={postId} 
            slug={slug} 
            replyToUsername={replyingTo} 
            onCommentSubmitted={clearReplyState} 
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Join the conversation</h3>
                <p className="text-muted-foreground">You need to be logged in to reply to this post.</p>
                <div className="flex justify-center gap-4">
                  <Link href={`/login?redirect=/post/${slug}`}>
                    <Button>Sign In</Button>
                  </Link>
                  <Link href={`/register?redirect=/post/${slug}`}>
                    <Button variant="outline">Register</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
} 