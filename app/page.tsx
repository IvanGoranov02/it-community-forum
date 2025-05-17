import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForumCategory } from "@/components/forum-category"
import { ForumPost } from "@/components/forum-post"
import { SearchBar } from "@/components/search-bar"
import { UserMenu } from "@/components/user-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { TagIcon } from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { getCategories, getRecentPosts, getPopularPosts } from "@/lib/api"
import { getUserNotifications, getUnreadNotificationsCount } from "@/app/actions/notifications"

export default async function Home() {
  const user = await getUser()
  const categories = await getCategories()
  const recentPosts = await getRecentPosts(6)
  const popularPosts = await getPopularPosts(5)

  // Get notifications if user is logged in
  const notifications = user ? await getUserNotifications(10) : []
  const unreadCount = user ? await getUnreadNotificationsCount() : 0

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TechTalk Forum</h1>
          <p className="text-muted-foreground mt-1">A community for IT professionals and enthusiasts</p>
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
      </header>

      <div className="flex items-center gap-4 mb-6">
        <Link href="/tags">
          <Button variant="outline" className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Browse Tags
          </Button>
        </Link>
        {user && (
          <Link href="/new-post">
            <Button>Create Post</Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="categories" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="recent">Recent Posts</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <div className="grid gap-6">
            {categories.map((category) => (
              <ForumCategory
                key={category.id}
                id={category.id}
                title={category.name}
                description={category.description || ""}
                icon={category.icon || "Code"}
                color={category.color || "bg-gray-100 dark:bg-gray-900"}
                slug={category.slug}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recent">
          <div className="grid gap-4">
            {recentPosts.map((post) => (
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
            ))}
            {recentPosts.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No posts yet. Be the first to create a post!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
        <TabsContent value="popular">
          <div className="grid gap-4">
            {popularPosts.map((post) => (
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
                isHot={true}
              />
            ))}
            {popularPosts.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No popular posts yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {!user ? (
        <Card>
          <CardHeader>
            <CardTitle>Join the Discussion</CardTitle>
            <CardDescription>
              Sign up to participate in discussions, ask questions, and share your knowledge with the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Link href="/register" className="w-full md:w-auto">
                <Button className="w-full">Register Now</Button>
              </Link>
              <Link href="/login" className="w-full md:w-auto">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <p>Join our growing community</p>
            <Link href="/about" className="hover:underline">
              Learn more
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Welcome back, {user.name}!</CardTitle>
            <CardDescription>Stay updated with the latest discussions in the IT community.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Link href="/new-post" className="w-full md:w-auto">
              <Button className="w-full">Create New Post</Button>
            </Link>
            <Link href="/my-posts" className="w-full md:w-auto">
              <Button variant="outline" className="w-full">
                My Posts
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <p>Share your knowledge with the community</p>
            <Link href="/guidelines" className="hover:underline">
              Posting guidelines
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
