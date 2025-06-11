import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForumCategory } from "@/components/forum-category"
import { ForumPost } from "@/components/forum-post"
import { SearchBar } from "@/components/search-bar"
import { UserMenu } from "@/components/user-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { TagIcon, Bug, LogIn, PlusCircle, TrendingUp, Clock } from "lucide-react"
import { getUser } from "@/app/actions/auth"
import { getCategories, getRecentPosts, getPopularPosts } from "@/lib/api"
import { getUserNotifications, getUnreadNotificationsCount } from "@/app/actions/notifications"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export const metadata = {
  title: "IT-Community - The Forum for IT Professionals | Programming & Tech Discussions",
  description: "Join IT-Community, the premier forum for IT professionals, developers, and tech enthusiasts. Discuss programming languages, share knowledge, get career advice, and connect with fellow IT professionals worldwide.",
  openGraph: {
    title: "IT-Community - The Forum for IT Professionals",
    description: "Join thousands of IT professionals in our vibrant community. Share knowledge, get help with technical problems, discuss latest tech trends, and advance your IT career.",
    images: ['/og-image.png'],
  },
  twitter: {
    title: "IT-Community - The Forum for IT Professionals",
    description: "Join thousands of IT professionals in our vibrant community. Share knowledge, get technical help, and advance your career.",
    images: ['/og-image.png'],
  },
}

export default async function Home() {
  const user: any = await getUser()
  const categories: any = await getCategories()
  const recentPosts: any = await getRecentPosts(6)
  const popularPosts: any = await getPopularPosts(5)

  // Get notifications if user is logged in
  const notifications: any = user ? await getUserNotifications(10) : []
  const unreadCount: any = user ? await getUnreadNotificationsCount() : 0

  console.log("Loaded notifications:", notifications.length, "Unread count:", unreadCount)
  console.log("User ID:", user?.id)

  console.log("Categories with counts:", categories)

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 bg-muted/30 p-6 rounded-lg">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">IT-Community</h1>
          <p className="text-muted-foreground mt-1">The Forum for IT Professionals & Tech Enthusiasts</p>
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

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <Link href="/tags">
          <Button variant="outline" className="flex items-center gap-2 hover:bg-primary/10">
            <TagIcon className="h-4 w-4" />
            Browse Tags
          </Button>
        </Link>
        {/* <Link href="/simple-login">
          <Button variant="outline" className="flex items-center gap-2 hover:bg-primary/10">
            <LogIn className="h-4 w-4" />
            Simple Login
          </Button>
        </Link> */}
        {user && (
          <Link href="/new-post">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
              <PlusCircle className="h-4 w-4" />
              Create Post
            </Button>
          </Link>
        )}
      </div>

      <Tabs defaultValue="categories" className="mb-8">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Posts
          </TabsTrigger>
          <TabsTrigger value="popular" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Popular
          </TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <div className="grid gap-6">
            {categories.map((category: any) => (
              <ForumCategory
                key={category.id}
                id={category.id}
                title={category.name}
                description={category.description || ""}
                icon={category.icon || "Code"}
                color={category.color || "bg-gray-100 dark:bg-gray-900"}
                slug={category.slug}
                postCount={category.postCount || 0}
                userCount={category.userCount || 0}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recent">
          <div className="grid gap-4">
            {recentPosts.map((post: any) => (
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
            {popularPosts.map((post: any) => (
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
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Join the Discussion</CardTitle>
            <CardDescription>
              Sign up to participate in discussions, ask questions, and share your knowledge with the community.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Link href="/register" className="w-full md:w-auto">
                <Button className="w-full bg-primary hover:bg-primary/90">Register Now</Button>
              </Link>
              <Link href="/login" className="w-full md:w-auto">
                <Button variant="outline" className="w-full hover:bg-primary/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground bg-muted/20">
            <p>Join our growing community</p>
            <Link href="/about" className="hover:underline hover:text-primary transition-colors">
              Learn more
            </Link>
          </CardFooter>
        </Card>
      ) : (
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Welcome back, {user.name}!</CardTitle>
            <CardDescription>Stay updated with the latest discussions in the IT community.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Link href="/new-post" className="w-full md:w-auto">
              <Button className="w-full bg-primary hover:bg-primary/90">Create New Post</Button>
            </Link>
            <Link href="/my-posts" className="w-full md:w-auto">
              <Button variant="outline" className="w-full hover:bg-primary/10">
                My Posts
              </Button>
            </Link>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground bg-muted/20">
            <p>Share your knowledge with the community</p>
            <Link href="/guidelines" className="hover:underline hover:text-primary transition-colors">
              Posting guidelines
            </Link>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
