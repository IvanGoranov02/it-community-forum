import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ForumPost } from "@/components/forum-post"
import { ChevronLeft } from "lucide-react"
import { getBookmarkedPosts } from "@/app/actions/bookmarks"
import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function BookmarksPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/bookmarks")
  }

  const bookmarkedPosts = await getBookmarkedPosts()

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forums
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Your Bookmarks</h1>
        <p className="text-muted-foreground mt-1">Posts you've saved for later</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookmarked Posts</CardTitle>
          <CardDescription>You have {bookmarkedPosts.length} bookmarked posts</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {bookmarkedPosts.length > 0 ? (
            bookmarkedPosts.map((post) => (
              <ForumPost
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author.username}
                authorId={post.author.id}
                category={post.category.name}
                categoryId={post.category.id}
                replies={post.comments?.[0]?.count || 0}
                views={post.views}
                votes={0} // We don't have votes in this query
                timestamp={post.created_at}
                slug={post.slug}
                isHot={post.views > 100}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">You haven't bookmarked any posts yet.</p>
              <Link href="/">
                <Button>Browse Posts</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
