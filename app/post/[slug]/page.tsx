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

export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const resolvedParams = { 
      slug: decodeURIComponent(params.slug) 
    };
    
    const post = await getPostBySlug(resolvedParams.slug)
    
    if (!post) {
      return {
        title: 'Post Not Found | IT-Community',
        description: 'The requested post could not be found.',
      }
    }

    // Create a clean excerpt from post content
    const excerpt = post.content 
      ? post.content.replace(/[#*`]/g, '').substring(0, 160) + '...'
      : `Discussion about ${post.title} in IT-Community Forum.`

    return {
      title: `${post.title} | IT-Community Forum`,
      description: excerpt,
      keywords: [
        post.title.split(' '),
        post.category?.name,
        'programming',
        'development',
        'IT community',
        'tech discussion'
      ].flat().filter(Boolean),
      openGraph: {
        title: post.title,
        description: excerpt,
        url: `/post/${resolvedParams.slug}`,
        images: ['/og-image.png'],
        type: 'article',
        publishedTime: post.created_at,
        modifiedTime: post.updated_at,
        authors: [post.author?.username || 'IT-Community User'],
        section: post.category?.name || 'General',
      },
      twitter: {
        title: post.title,
        description: excerpt,
        images: ['/og-image.png'],
        card: 'summary_large_image',
      },
      alternates: {
        canonical: `/post/${resolvedParams.slug}`,
      },
    }
  } catch (error) {
    console.error('Error generating post metadata:', error)
    return {
      title: 'IT-Community Forum',
      description: 'The Forum for IT Professionals & Tech Enthusiasts',
    }
  }
}

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
      <>
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DiscussionForumPosting",
              "headline": post.title,
              "text": post.content,
              "datePublished": post.created_at,
              "dateModified": post.updated_at,
              "author": {
                "@type": "Person",
                "name": post.author?.username || "IT-Community User",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL}/profile/${post.author?.username}`
              },
              "publisher": {
                "@type": "Organization",
                "name": "IT-Community",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/post/${resolvedParams.slug}`
              },
              "discussionUrl": `${process.env.NEXT_PUBLIC_SITE_URL}/post/${resolvedParams.slug}`,
              "commentCount": comments.length,
              "interactionStatistic": [
                {
                  "@type": "InteractionCounter",
                  "interactionType": "https://schema.org/CommentAction",
                  "userInteractionCount": comments.length
                },
                {
                  "@type": "InteractionCounter", 
                  "interactionType": "https://schema.org/ViewAction",
                  "userInteractionCount": post.views || 0
                }
              ],
              "about": {
                "@type": "Thing",
                "name": post.category?.name || "General Discussion"
              }
            })
          }}
        />
        
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
      </>
    )
  } catch (error) {
    console.error("Error in PostPage:", error)
    notFound()
  }
}
