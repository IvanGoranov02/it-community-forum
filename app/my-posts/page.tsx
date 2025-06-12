import { getUser } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { MessageSquare, Eye, ThumbsUp, Calendar, Plus, ChevronLeft } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function MyPostsPage() {
  try {
    const user = await getUser()

    if (!user) {
      redirect("/login?redirect=/my-posts")
    }

    // Директно използваме Supabase клиента, за да избегнем проблеми с кеширането
    const supabase = createServerClient()

    const { data: posts, error } = await supabase
      .from("posts")
      .select(`
        *,
        category:categories(*),
        comments:comments(count)
      `)
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching posts:", error)
      throw new Error(error.message)
    }

    // Calculate total votes for each post
    const postsWithVotes = await Promise.all(
      (posts || []).map(async (post) => {
        const { data: votesData, error: votesError } = await supabase
          .from("post_votes")
          .select("vote_type")
          .eq("post_id", post.id)

        if (votesError) {
          console.error(`Error fetching votes for post ${post.id}:`, votesError)
          return { ...post, total_votes: 0 }
        }

        const totalVotes = votesData.reduce((sum, vote) => sum + vote.vote_type, 0)

        return { ...post, total_votes: totalVotes }
      }),
    )

    console.log(`Found ${postsWithVotes.length} posts for user ${user.id}`)

    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-primary mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Forums
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Posts</h1>
              <p className="text-muted-foreground mt-1">Manage your forum posts</p>
            </div>
            <Link href="/new-post">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Post
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-4 grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
            <TabsTrigger value="all" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">All Posts ({postsWithVotes.length})</span>
              <span className="xs:hidden">All ({postsWithVotes.length})</span>
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Active ({postsWithVotes.filter((p) => !p.is_archived).length})</span>
              <span className="xs:hidden">Active ({postsWithVotes.filter((p) => !p.is_archived).length})</span>
            </TabsTrigger>
            <TabsTrigger value="archived" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Archived ({postsWithVotes.filter((p) => p.is_archived).length})</span>
              <span className="xs:hidden">Arch. ({postsWithVotes.filter((p) => p.is_archived).length})</span>
            </TabsTrigger>
          </TabsList>

          {["all", "active", "archived"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {postsWithVotes.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">You haven't created any posts yet.</p>
                    <Link href="/new-post">
                      <Button>Create Your First Post</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                postsWithVotes
                  .filter((post) => {
                    if (tab === "all") return true
                    if (tab === "active") return !post.is_archived
                    if (tab === "archived") return post.is_archived
                    return true
                  })
                  .map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <CardHeader className="p-6 flex flex-row items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold mb-2">
                            <Link href={`/post/${post.slug}`} className="hover:text-primary transition-colors">
                              {post.title}
                            </Link>
                          </CardTitle>
                          <CardDescription className="flex flex-wrap items-center gap-2">
                            <Link href={`/category/${post.category?.slug || "#"}`}>
                              <Badge variant="secondary" className="hover:bg-secondary/80">
                                {post.category?.name || "Uncategorized"}
                              </Badge>
                            </Link>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(post.created_at)}</span>
                            </div>
                            {post.is_archived && (
                              <Badge
                                variant="outline"
                                className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                              >
                                Archived
                              </Badge>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/post/edit/${post.id}`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 pb-4">
                        <p className="text-muted-foreground line-clamp-2">
                          {post.content.replace(/<[^>]*>/g, "").substring(0, 200)}
                          {post.content.length > 200 ? "..." : ""}
                        </p>
                      </CardContent>
                      <CardFooter className="px-6 py-4 bg-muted/20 flex justify-between border-t">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.total_votes || 0} votes</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.comments?.[0]?.count || 0} replies</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Eye className="h-4 w-4" />
                            <span>{post.views || 0} views</span>
                          </div>
                        </div>
                        <Link href={`/post/${post.slug}`}>
                          <Button variant="ghost" size="sm">
                            View Post
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))
              )}

              {tab !== "all" &&
                postsWithVotes.filter((post) => {
                  if (tab === "active") return !post.is_archived
                  if (tab === "archived") return post.is_archived
                  return false
                }).length === 0 &&
                postsWithVotes.length > 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground">
                        {tab === "active" ? "You don't have any active posts." : "You don't have any archived posts."}
                      </p>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error("Error in MyPostsPage:", error)
    return (
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-6">My Posts</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">An error occurred while loading your posts: {(error as Error).message}</p>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}
