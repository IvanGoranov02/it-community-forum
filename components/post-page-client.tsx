"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Calendar, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { VoteButtons } from "@/components/vote-buttons"
import { PostReplyButton } from "@/components/post-reply-button"
import { BookmarkButton } from "@/components/bookmark-button"
import { ShareDialog } from "@/components/share-dialog"
import { ReportDialog } from "@/components/report-dialog"
import { PostTags } from "@/components/post-tags"
import { PostContent } from "@/components/post-content"
import { CommentSection } from "@/src/components/comment-section"
import { ProfilePopup } from "@/components/ProfilePopup"
import { Share2, Flag } from "lucide-react"

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
  }

  const clearReplyState = () => {
    setReplyingTo(null)
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="space-y-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className="flex items-start gap-4">
              <ProfilePopup username={post.author?.username || "Unknown"}>
                <Avatar className="h-10 w-10 border">
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
              <div>
                <h1 className="text-2xl font-bold">{post.title}</h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mt-1">
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
              <Badge variant="outline" className="ml-auto">
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

        <CardContent>
          <PostContent content={post.content} />
        </CardContent>

        <CardFooter className="flex justify-between p-6 border-t bg-muted/20">
          <div className="flex items-center gap-4">
            <VoteButtons postId={post.id} initialVotes={post.total_votes} />
            <PostReplyButton 
              authorUsername={post.author?.username || "Unknown"} 
              onReply={handleReply}
            />
          </div>
          <div className="flex items-center gap-2">
            <BookmarkButton postId={post.id} initialBookmarked={isBookmarked} />
            <ShareDialog url={`/post/${slug}`} title={post.title}>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                <Share2 className="h-4 w-4" />
              </button>
            </ShareDialog>
            <ReportDialog contentType="post" contentId={post.id}>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                <Flag className="h-4 w-4" />
              </button>
            </ReportDialog>
          </div>
        </CardFooter>
      </Card>

      <CommentSection 
        comments={comments} 
        postId={post.id} 
        slug={slug} 
        user={user}
        replyingTo={replyingTo}
        onClearReply={clearReplyState}
      />
    </>
  )
} 