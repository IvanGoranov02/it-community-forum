import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SearchBar } from "@/components/search-bar"
import { UserMenu } from "@/components/user-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { ChevronLeft, TagIcon } from "lucide-react"
import { getTags } from "@/app/actions/tags"
import { getUser } from "@/app/actions/auth"
import { getUserNotifications, getUnreadNotificationsCount } from "@/app/actions/notifications"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export default async function TagsPage() {
  const user = await getUser()
  const tags = await getTags()

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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Browse Tags</h1>
            <p className="text-muted-foreground mt-1">Find topics by tags</p>
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
          <CardTitle>All Tags</CardTitle>
          <CardDescription>Browse posts by tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.slug}`}>
                  <Badge variant="outline" className="px-3 py-1 hover:bg-secondary">
                    <TagIcon className="h-3 w-3 mr-1" />
                    {tag.name}
                  </Badge>
                </Link>
              ))
            ) : (
              <div className="text-center py-8 w-full">
                <p className="text-muted-foreground mb-4">No tags have been created yet.</p>
                <Link href="/new-post">
                  <Button>Create a post with tags</Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
