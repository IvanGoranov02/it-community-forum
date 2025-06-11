import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, MessageSquare, Flag, Share2, Eye, Calendar, Clock } from "lucide-react"
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
import { PostPageClient } from "@/components/post-page-client"

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

          <h2 className="text-xl font-semibold mt-6 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Replies ({comments.length})
          </h2>

          <PostPageClient 
            post={post}
            comments={comments}
            user={user}
            isBookmarked={isBookmarked}
            tagsData={tagsData}
            slug={resolvedParams.slug}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in PostPage:", error)
    notFound()
  }
}
