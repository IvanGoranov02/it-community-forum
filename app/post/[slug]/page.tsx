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

// Mark this page as dynamic
export const dynamic = "force-dynamic"

interface PostPageProps {
  params: {
    slug: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    // Await params
    const resolvedParams = await params

    const user = await getUser()
    const post = await getPostBySlug(resolvedParams.slug)

    if (!post) {
      console.error(`Post with slug ${resolvedParams.slug} not found, redirecting to 404`)
      notFound()
    }

    const comments = await getCommentsByPostId(post.id)
    const isBookmarked = user ? await isPostBookmarked(post.id) : false
    const tags = await getPostTags(post.id)
    const isAuthor = user?.id === post.author_id

    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Forums
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Link href={`/category/${post.category?.slug || "#"}`}>
              <Badge variant="secondary" className="hover:bg-secondary/80">
                {post.category?.name || "Uncategorized"}
              </Badge>
            </Link>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{post.views} views</span>
            </div>
            {post.is_archived && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                Archived
              </Badge>
            )}
          </div>
          <PostTags tags={tags} />
        </div>

        <div className="grid gap-6 mb-8">
          <Card className="border-l-4 border-l-primary overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 bg-muted/30">
              <div className="flex items-start gap-4">
                <ProfilePopup username={post.author?.username}>
                  <Avatar className="h-12 w-12 border group-hover:ring-2 group-hover:ring-primary transition">
                    <AvatarImage
                      src={
                        post.author?.avatar_url ||
                        `/placeholder.svg?height=48&width=48&query=${post.author?.username || "user"}`
                      }
                      alt={post.author?.username || "User"}
                    />
                    <AvatarFallback>{post.author?.username?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </ProfilePopup>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ProfilePopup username={post.author?.username}>
                      <span className="font-semibold hover:underline hover:text-primary transition-colors cursor-pointer">
                        {post.author?.username || "Unknown User"}
                      </span>
                    </ProfilePopup>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {post.author?.role === "admin"
                        ? "Admin"
                        : post.author?.role === "moderator"
                          ? "Moderator"
                          : "Member"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(post.author?.created_at || new Date().toISOString())} •{" "}
                    {post.author?.reputation || 0} reputation
                  </p>
                </div>
              </div>
              {isAuthor && <PostActions postId={post.id} postSlug={post.slug} isAuthor={isAuthor} />}
            </CardHeader>
            <CardContent className="px-6 py-4">
              <div className="prose dark:prose-invert max-w-none">
                <PostContent content={post.content} />
              </div>
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
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
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
