"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Flag, Share2, Clock, MoreHorizontal } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { createNewComment } from "@/app/actions/comments"
import { PostContent } from "@/components/post-content"
import { ReportDialog } from "@/components/report-dialog"
import { ProfilePopup } from "@/components/ProfilePopup"
import Link from "next/link"
import { ShareDialog } from "@/components/share-dialog"
import { CommentDeleteButton } from "@/components/comment-delete-button"
import { CommentEditButton } from "@/components/comment-edit-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Компонент за форма за коментар с loading state
export function CommentForm({ postId, slug, replyToUsername = null, onCommentSubmitted }: { postId: string; slug: string; replyToUsername?: string | null; onCommentSubmitted?: () => void }) {
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
    <div className="space-y-4 bg-muted/20 p-4 md:p-6 rounded-lg border">
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
          className="min-h-[120px] md:min-h-[150px] focus-visible:ring-primary"
          required
          disabled={isSubmitting}
        />
        <div className="flex justify-end mt-4">
          <Button type="submit" className="bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={isSubmitting}>
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

// Компонент за показване на коментарите
export function Comments({ comments, slug, user, replyingTo, onReply }: any) {
  return (
    <>
      {comments.length > 0 ? (
        comments.map((comment: any) => (
          <Card key={comment.id} id={`comment-${comment.id}`} className="border-l-4 border-l-secondary/70">
            <CardHeader className="flex flex-row items-start gap-3 md:gap-4 p-4 md:p-6 bg-muted/20">
              <ProfilePopup username={comment.author?.username}>
                <Avatar className="h-8 w-8 md:h-10 md:w-10 border group-hover:ring-2 group-hover:ring-primary transition">
                  <AvatarImage
                    src={
                      comment.author?.avatar_url ||
                      `/placeholder.svg?height=40&width=40&query=${comment.author?.username || "user"}`
                    }
                    alt={comment.author?.username || "User"}
                  />
                  <AvatarFallback>{comment.author?.username?.slice(0, 2).toUpperCase() || "UN"}</AvatarFallback>
                </Avatar>
              </ProfilePopup>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <ProfilePopup username={comment.author?.username}>
                    <span className="font-semibold hover:underline hover:text-primary transition-colors cursor-pointer text-sm md:text-base">
                      {comment.author?.username || "Unknown User"}
                    </span>
                  </ProfilePopup>
                  <Badge
                    variant="outline"
                    className={
                      comment.author?.role === "admin" || comment.author?.email === "i.goranov02@gmail.com"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs"
                        : comment.author?.role === "moderator"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 text-xs"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs"
                    }
                  >
                    {comment.author?.role === "admin" || comment.author?.email === "i.goranov02@gmail.com"
                      ? "Admin"
                      : comment.author?.role === "moderator"
                        ? "Moderator"
                        : "Member"}
                  </Badge>
                </div>
                <div className="flex items-center text-xs md:text-sm text-muted-foreground">
                  <span>{formatDate(comment.created_at)}</span>
                  {comment.is_edited && (
                    <div className="flex items-center ml-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>edited</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6 py-3 md:py-4">
              <div className="prose dark:prose-invert max-w-none text-sm md:text-base">
                <PostContent content={comment.content} />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-4 md:p-6 border-t bg-muted/10">
              {/* Mobile: Stack buttons vertically, Desktop: Side by side */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="flex items-center gap-1 text-xs md:text-sm"
                  onClick={() => {
                    onReply(comment.author?.username || null)
                    // Scroll to comment form
                    document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">Reply</span>
                </Button>
                
                {user && (
                  <div className="flex items-center gap-1">
                    <CommentEditButton 
                      commentId={comment.id}
                      postSlug={slug}
                      isAuthor={user.id === comment.author_id}
                      userEmail={user.email}
                      initialContent={comment.content}
                    />
                    <CommentDeleteButton 
                      commentId={comment.id}
                      isAuthor={user.id === comment.author_id}
                      isAdmin={user.role === "admin"}
                      userEmail={user.email}
                    />
                  </div>
                )}
              </div>
              
              {/* Mobile: Dropdown menu for secondary actions, Desktop: Show all buttons */}
              <div className="flex items-center gap-1">
                {/* Desktop: Show all buttons */}
                <div className="hidden sm:flex items-center gap-1">
                <ShareDialog url={`/post/${slug}#comment-${comment.id}`} title="Share this comment">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <Share2 className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Share
                  </Button>
                </ShareDialog>
                <ReportDialog contentType="comment" contentId={comment.id}>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
                </ReportDialog>
                </div>
                
                {/* Mobile: Dropdown menu */}
                <div className="sm:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <ShareDialog url={`/post/${slug}#comment-${comment.id}`} title="Share this comment">
                        <DropdownMenuItem className="cursor-pointer">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                      </ShareDialog>
                      <ReportDialog contentType="comment" contentId={comment.id}>
                        <DropdownMenuItem className="cursor-pointer">
                          <Flag className="h-4 w-4 mr-2" />
                          Report
                        </DropdownMenuItem>
                      </ReportDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))
      ) : (
        <Card className="border border-dashed">
          <CardContent className="p-4 md:p-6 text-center">
            <p className="text-muted-foreground text-sm md:text-base">No replies yet. Be the first to reply!</p>
          </CardContent>
        </Card>
      )}
    </>
  )
}

// Основен компонент за секцията с коментари (само за показване на коментарите)
export function CommentSection({ comments, slug, user, replyingTo, onReply }: any) {
  return (
    <Comments 
      comments={comments} 
      slug={slug} 
      user={user}
      replyingTo={replyingTo}
      onReply={onReply}
    />
  )
} 