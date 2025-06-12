import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForumPost } from "@/components/forum-post"
import { SearchBar } from "@/components/search-bar"
import { UserMenu } from "@/components/user-menu"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { ChevronLeft } from "lucide-react"
import { getCategoryBySlug, getPostsByCategory } from "@/lib/api"
import { getUser } from "@/app/actions/auth"
import { getUserNotifications, getUnreadNotificationsCount } from "@/app/actions/notifications"
import { notFound } from "next/navigation"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const resolvedParams = await params
  const category = await getCategoryBySlug(resolvedParams.slug)
  
  if (!category) {
    return {
      title: 'Category Not Found | IT-Community',
      description: 'The requested category could not be found.',
    }
  }

  return {
    title: `${category.name} - IT-Community Forum`,
    description: `Explore ${category.name} discussions in IT-Community. ${category.description || `Join the conversation about ${category.name.toLowerCase()} with fellow IT professionals and tech enthusiasts.`}`,
    openGraph: {
      title: `${category.name} - IT-Community Forum`,
      description: `Explore ${category.name} discussions in IT-Community. ${category.description || `Join the conversation about ${category.name.toLowerCase()} with fellow IT professionals and tech enthusiasts.`}`,
      url: `/category/${resolvedParams.slug}`,
      images: ['/og-image.png'],
    },
    twitter: {
      title: `${category.name} - IT-Community Forum`,
      description: `Explore ${category.name} discussions in IT-Community. ${category.description || `Join the conversation about ${category.name.toLowerCase()} with fellow IT professionals and tech enthusiasts.`}`,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `/category/${resolvedParams.slug}`,
    },
  }
}

interface CategoryPageProps {
  params: {
    slug: string
  }
  searchParams: {
    sort?: string
  }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  // Await params и searchParams
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams

  const user = await getUser()
  const category = await getCategoryBySlug(resolvedParams.slug)

  if (!category) {
    console.error(`Category not found with slug or id: ${resolvedParams.slug}`)
    notFound()
  }

  const posts = await getPostsByCategory(category.id)

  // Get notifications if user is logged in
  const notifications = user ? await getUserNotifications(10) : []
  const unreadCount = user ? await getUnreadNotificationsCount() : 0

  // Sort posts based on the selected tab
  const sortedPosts = [...posts]
  const sort = resolvedSearchParams.sort || "recent"

  if (sort === "popular") {
    sortedPosts.sort((a, b) => b.total_votes - a.total_votes)
  } else if (sort === "recent") {
    sortedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sort === "unanswered") {
    sortedPosts.sort((a, b) => {
      const aHasComments = (a.comments?.[0]?.count || 0) > 0
      const bHasComments = (b.comments?.[0]?.count || 0) > 0
      if (!aHasComments && bHasComments) return -1
      if (aHasComments && !bHasComments) return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forums
        </Link>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-muted-foreground mt-1">{category.description}</p>
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

      <Tabs defaultValue={sort} className="mb-8">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6 h-auto">
          <TabsTrigger value="all" asChild className="text-xs sm:text-sm py-2">
            <Link href={`/category/${resolvedParams.slug}`}>
              <span className="hidden xs:inline">All Topics</span>
              <span className="xs:hidden">All</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="popular" asChild className="text-xs sm:text-sm py-2">
            <Link href={`/category/${resolvedParams.slug}?sort=popular`}>
              <span className="hidden xs:inline">Popular</span>
              <span className="xs:hidden">Pop.</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="recent" asChild className="text-xs sm:text-sm py-2">
            <Link href={`/category/${resolvedParams.slug}?sort=recent`}>
              <span className="hidden xs:inline">Recent</span>
              <span className="xs:hidden">New</span>
            </Link>
          </TabsTrigger>
          <TabsTrigger value="unanswered" asChild className="text-xs sm:text-sm py-2">
            <Link href={`/category/${resolvedParams.slug}?sort=unanswered`}>
              <span className="hidden xs:inline">Unanswered</span>
              <span className="xs:hidden">No Reply</span>
            </Link>
          </TabsTrigger>
        </TabsList>
        <Card>
          <CardHeader>
            <CardTitle>
              {sort === "popular"
                ? "Popular Topics"
                : sort === "recent"
                  ? "Recent Topics"
                  : sort === "unanswered"
                    ? "Unanswered Topics"
                    : "All Topics"}
            </CardTitle>
            <CardDescription>
              {sort === "popular"
                ? "Most discussed topics in"
                : sort === "recent"
                  ? "Recently posted topics in"
                  : sort === "unanswered"
                    ? "Topics with no replies in"
                    : "Showing all topics in"}{" "}
              {category.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {sortedPosts.length > 0 ? (
              sortedPosts.map((post) => (
                <ForumPost
                  key={post.id}
                  id={post.id}
                  title={post.title}
                  author={post.author.username}
                  authorId={post.author.id}
                  category={category.name}
                  categoryId={category.id}
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
                <p className="text-muted-foreground mb-4">No posts in this category yet.</p>
                <Link href={`/new-post?category=${category.id}`}>
                  <Button>Create the first post</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
