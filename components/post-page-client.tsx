"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Calendar, Clock, MessageSquare } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { VoteButtons } from "@/components/vote-buttons"
import { PostReplyButton } from "@/components/post-reply-button"
import { BookmarkButton } from "@/components/bookmark-button"
import { ShareDialog } from "@/components/share-dialog"
import { ReportDialog } from "@/components/report-dialog"
import { PostTags } from "@/components/post-tags"
import { PostContent } from "@/components/post-content"
import { CommentForm, Comments } from "@/src/components/comment-section"
import { ProfilePopup } from "@/components/ProfilePopup"
import { Share2, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface PostPageClientProps {
  post: any
  comments: any[]
  user: any
  isBookmarked: boolean
  tagsData: any[]
  slug: string
}

export function PostPageClient({ post, comments, user, isBookmarked, tagsData, slug }: PostPageClientProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const handleReply = (username: string) => {
    setReplyingTo(username)
    // Scroll to comment form
    document.getElementById("comment-form")?.scrollIntoView({ behavior: "smooth" })
  }

  const clearReplyState = () => {
    setReplyingTo(null)
  }

  return (
    <>
      {/* Post Card */}
      <Card className="mb-6">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex items-start gap-3 md:gap-4">
              <ProfilePopup username={post.author?.username || "Unknown"}>
                <Avatar className="h-8 w-8 md:h-10 md:w-10 border">
                  <AvatarImage
                    src={
                      post.author?.avatar_url ||
                      `/placeholder.svg?height=40&width=40&query=${post.author?.username}`
                    }
                    alt={post.author?.username || "Unknown"}
                  />
                  <AvatarFallback>
                    {post.author?.username?.slice(0, 2).toUpperCase() || "UN"}
                  </AvatarFallback>
                </Avatar>
              </ProfilePopup>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold break-words">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-2 text-xs md:text-sm mt-1">
                  <span className="text-muted-foreground">
                    Posted by{" "}
                    <Link
                      href={`/profile/${post.author?.username || "unknown"}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {post.author?.username || "Unknown"}
                    </Link>
                  </span>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(post.created_at)}
                    {post.is_edited && (
                      <div className="flex items-center ml-2 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>edited</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Eye className="h-3 w-3 mr-1" />
                    {post.views} views
                  </div>
                </div>
              </div>
            </div>
            <div>
              <Badge variant="outline" className="ml-auto text-xs">
                {post.category?.name}
              </Badge>
            </div>
          </div>

          {tagsData.length > 0 && (
            <div>
              <PostTags tags={tagsData} />
            </div>
          )}
        </CardHeader>

        <CardContent className="px-4 md:px-6">
          <PostContent content={post.content} />
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-4 md:p-6 border-t bg-muted/20">
          <div className="flex items-center gap-2 md:gap-4">
            <VoteButtons postId={post.id} initialVotes={post.total_votes} />
            <PostReplyButton 
              authorUsername={post.author?.username || "Unknown"} 
              onReply={handleReply}
            />
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton postId={post.id} initialBookmarked={isBookmarked} />
            <ShareDialog url={`/post/${slug}`} title={post.title}>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 md:h-10 md:w-10">
                <Share2 className="h-3 w-3 md:h-4 md:w-4" />
              </button>
            </ShareDialog>
            <ReportDialog contentType="post" contentId={post.id}>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 md:h-10 md:w-10">
                <Flag className="h-3 w-3 md:h-4 md:w-4" />
              </button>
            </ReportDialog>
          </div>
        </CardFooter>
      </Card>

      {/* Comment Form - Right after the post */}
      <div id="comment-form" className="mb-6">
        {user ? (
          <CommentForm 
            postId={post.id} 
            slug={slug} 
            replyToUsername={replyingTo} 
            onCommentSubmitted={clearReplyState} 
          />
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-4 md:p-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground text-sm md:text-base">You need to be logged in to reply</p>
                <Link href={`/login?redirect=/post/${slug}`}>
                  <Button className="w-full sm:w-auto">Login to Reply</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Comments Section Header */}
      <div className="mb-4">
        <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          Replies ({comments.length})
        </h2>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        <Comments 
          comments={comments} 
          slug={slug} 
          user={user}
          replyingTo={replyingTo}
          onReply={handleReply}
        />
      </div>
    </>
  )
} 