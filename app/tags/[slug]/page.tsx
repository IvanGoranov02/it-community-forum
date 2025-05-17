import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ForumPost } from "@/components/forum-post"
import { SearchBar } from "@/components/search-bar"
import { UserMenu } from "@/components/user-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { ChevronLeft, TagIcon } from "lucide-react"
import { getTagBySlug, getPostsByTag } from "@/app/actions/tags"
import { getUser } from "@/app/actions/auth"
import { getUserNotifications, getUnreadNotificationsCount } from "@/app/actions/notifications"
import { notFound } from "next/navigation"

interface TagPageProps {
  params: {
    slug: string
  }
}

export default async function TagPage({ params }: TagPageProps) {
  const user = await getUser()
  const tag = await getTagBySlug(params.slug)

  if (!tag) {
    notFound()
  }

  const posts = await getPostsByTag(tag.id)

  // Get notifications if user is logged in
  const notifications = user ? await getUserNotifications(10) : []
  const unreadCount = user ? await getUnreadNotificationsCount() : 0

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forums
        </Link>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{tag.name}</h1>
              {tag.description && <p className="text-muted-foreground mt-1">{tag.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <SearchBar className="w-full md:w-[300px]" />
            {user && (
              <NotificationsDropdown
                userId={user.id}
                initialNotifications={notifications}
                initialUnreadCount={unreadCount}
              />
            )}
            <UserMenu user={user} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posts tagged with "{tag.name}"</CardTitle>
          <CardDescription>Showing {posts.length} posts with this tag</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {posts.length > 0 ? (
            posts.map((post) => (
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
                votes={post.total_votes}
                timestamp={post.created_at}
                slug={post.slug}
                isHot={post.total_votes > 10 || post.views > 100}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No posts with this tag yet.</p>
              <Link href="/new-post">
                <Button>Create a post</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
