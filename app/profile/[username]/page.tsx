import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ForumPost } from "@/components/forum-post"
import { createServerClient } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { getUser } from "@/app/actions/auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const currentUser = await getUser()
  const supabase = createServerClient()

  // Get user profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", params.username).single()

  if (error || !profile) {
    notFound()
  }

  // Get user's posts
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      author:profiles(*),
      category:categories(*),
      comments:comments(count)
    `)
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })

  // Get user's comments
  const { data: comments } = await supabase
    .from("comments")
    .select(`
      *,
      post:posts(*)
    `)
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forums
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-start gap-4 p-6">
          <Avatar className="h-20 w-20 border">
            <AvatarImage src={profile.avatar_url || `/placeholder.svg?height=80&width=80`} alt={profile.username} />
            <AvatarFallback>{profile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {profile.role === "admin" ? "Admin" : profile.role === "moderator" ? "Moderator" : "Member"}
              </Badge>
            </div>
            <p className="text-muted-foreground">@{profile.username}</p>
            <div className="flex items-center gap-4 mt-2">
              <div>
                <span className="text-sm text-muted-foreground">Member since</span>
                <p className="font-medium">{formatDate(profile.created_at)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Reputation</span>
                <p className="font-medium">{profile.reputation}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Posts</span>
                <p className="font-medium">{posts?.length || 0}</p>
              </div>
            </div>
            {profile.bio && <p className="mt-4">{profile.bio}</p>}
          </div>
          {isOwnProfile && (
            <div className="ml-auto">
              <Link href="/profile/edit">
                <Button variant="outline">Edit Profile</Button>
              </Link>
            </div>
          )}
        </CardHeader>
      </Card>

      <Tabs defaultValue="posts" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Posts by {profile.username}</CardTitle>
              <CardDescription>All posts created by this user</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {posts && posts.length > 0 ? (
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
                    votes={0} // We don't have votes in this query
                    timestamp={post.created_at}
                    slug={post.slug}
                    isHot={post.views > 100}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">This user hasn't created any posts yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle>Comments by {profile.username}</CardTitle>
              <CardDescription>All comments made by this user</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <Card key={comment.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="mb-2">
                        <Link href={`/post/${comment.post.slug}`} className="text-sm font-medium hover:underline">
                          Re: {comment.post.title}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</p>
                      </div>
                      <p className="line-clamp-2">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">This user hasn't made any comments yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
