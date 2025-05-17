import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, MessageSquare, Flag, Share2 } from "lucide-react"
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

// Mark this page as dynamic
export const dynamic = "force-dynamic"

interface PostPageProps {
  params: {
    slug: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const user = await getUser()
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  const comments = await getCommentsByPostId(post.id)
  const isBookmarked = await isPostBookmarked(post.id)
  const tags = await getPostTags(post.id)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forums
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{post.title}</h1>
        <div className="flex items-center gap-2 mt-2">
          <Link href={`/category/${post.category.slug}`}>
            <Badge variant="secondary">{post.category.name}</Badge>
          </Link>
          <span className="text-sm text-muted-foreground">{formatDate(post.created_at)}</span>
        </div>
        <PostTags tags={tags} />
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-start gap-4 p-6">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src={`/placeholder.svg?height=48&width=48`} alt={post.author.username} />
              <AvatarFallback>{post.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.author.username}</h3>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {post.author.role === "admin" ? "Admin" : post.author.role === "moderator" ? "Moderator" : "Member"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Member since {formatDate(post.author.created_at)} • {post.author.reputation} reputation
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <PostContent content={post.content} />
          </CardContent>
          <CardFooter className="flex justify-between p-6 border-t">
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
              <Button variant="ghost" size="icon">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>

        <h2 className="text-xl font-semibold mt-6 mb-4">Replies ({comments.length})</h2>

        {comments.length > 0 ? (
          comments.map((comment) => (
            <Card key={comment.id} id={`comment-${comment.id}`}>
              <CardHeader className="flex flex-row items-start gap-4 p-6">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={comment.author.username} />
                  <AvatarFallback>{comment.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{comment.author.username}</h3>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      {comment.author.role === "admin"
                        ? "Admin"
                        : comment.author.role === "moderator"
                          ? "Moderator"
                          : "Member"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(comment.created_at)}</p>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <PostContent content={comment.content} />
              </CardContent>
              <CardFooter className="flex justify-between p-6 border-t">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>Reply</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
            </CardContent>
          </Card>
        )}

        <Separator />

        {user ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add Your Reply</h3>
            <form action={createNewComment}>
              <input type="hidden" name="postId" value={post.id} />
              <input type="hidden" name="slug" value={params.slug} />
              <Textarea
                name="content"
                placeholder="Share your thoughts... Use @username to mention users"
                className="min-h-[150px]"
                required
              />
              <div className="flex justify-end mt-4">
                <Button type="submit">Post Reply</Button>
              </div>
            </form>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Join the conversation</h3>
                <p className="text-muted-foreground">You need to be logged in to reply to this post.</p>
                <div className="flex justify-center gap-4">
                  <Link href={`/login?redirect=/post/${params.slug}`}>
                    <Button>Sign In</Button>
                  </Link>
                  <Link href={`/register?redirect=/post/${params.slug}`}>
                    <Button variant="outline">Register</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
