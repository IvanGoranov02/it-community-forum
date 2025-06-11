import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, MessageSquare, Flag, Share2, Eye, Calendar } from "lucide-react"
import { getPostBySlug, getCommentsByPostId } from "@/lib/api"
import { getUser } from "@/app/actions/auth"
import { formatDate } from "@/lib/utils"
import { notFound } from "next/navigation"
import { createNewComment } from "@/app/actions/comments"
import { VoteButtons } from "@/components/vote-buttons"
import { BookmarkButton } from "@/components/bookmark-button"
import { isPostBookmarked } from "@/app/actions/bookmarks"
import { getPostTags } from "@/app/actions/tags"
import { PostTags } from "@/components/post-tags"
import { PostContent } from "@/components/post-content"
import { ReportDialog } from "@/components/report-dialog"
import { PostActions } from "@/components/post-actions"
import { ProfilePopup } from "@/components/ProfilePopup"
import { CommentSection } from "../../../src/components/comment-section"
import { ShareDialog } from "@/components/share-dialog"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

interface PostPageProps {
  params: {
    slug: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    // Resolve the slug parameter (handle encoded slugs)
    const resolvedParams = { 
      slug: decodeURIComponent(params.slug) 
    };

    // Get post data
    const post = await getPostBySlug(resolvedParams.slug)

    if (!post) {
      notFound()
    }

    // Get user
    const user = await getUser()

    // Get comments
    const comments = await getCommentsByPostId(post.id)

    // Check if post is bookmarked by current user
    const isBookmarked = user ? await isPostBookmarked(post.id) : false

    // Get post tags
    const tagsData = await getPostTags(post.id);

    // Check if current user is post author or admin
    const isAuthor = user ? user.id === post.author_id : false
    const isAdmin = user ? user.role === "admin" : false

    return (
      <div className="container mx-auto py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-primary">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to home
            </Link>
          </div>

          {(isAuthor || isAdmin || user?.email === "i.goranov02@gmail.com") && (
            <div className="mb-6">
              <PostActions 
                postId={post.id} 
                postSlug={resolvedParams.slug} 
                isAuthor={isAuthor} 
                isAdmin={isAdmin} 
                userEmail={user?.email}
              />
            </div>
          )}

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
                    { post.category?.name}
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
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>Reply</span>
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <BookmarkButton postId={post.id} initialBookmarked={isBookmarked} />
                <ShareDialog url={`/post/${resolvedParams.slug}`} title={post.title}>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </ShareDialog>
                <ReportDialog contentType="post" contentId={post.id}>
                  <Button variant="ghost" size="icon">
                    <Flag className="h-4 w-4" />
                  </Button>
                </ReportDialog>
              </div>
            </CardFooter>
          </Card>

          <h2 className="text-xl font-semibold mt-6 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Replies ({comments.length})
          </h2>

          <CommentSection 
            comments={comments} 
            postId={post.id} 
            slug={resolvedParams.slug} 
            user={user} 
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in PostPage:", error)
    notFound()
  }
}
