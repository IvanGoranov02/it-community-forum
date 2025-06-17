import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"

type Props = {
  params: { username: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Await params
  const resolvedParams = await params
  const username = decodeURIComponent(resolvedParams.username)

  return {
    title: `${username}'s Profile | IT Community Forum`,
    description: `View ${username}'s profile and posts`,
  }
}

export default async function ProfilePage({ params }: Props) {
  // Await params
  const resolvedParams = await params

  const supabase = createServerClient()
  const currentUser = await getUser()
  
  // Decode the username from the URL to handle spaces and special characters
  const username = decodeURIComponent(resolvedParams.username)

  // Get user profile
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (error || !profile) {
    console.error("Profile not found for username:", username, error)
    notFound()
  }

  // Get user posts with proper vote calculation
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, slug, created_at, views")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })

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
    })
  )

  // Get user comments
  const { data: comments } = await supabase
    .from("comments")
    .select("id, content, created_at, post_id, posts(title, slug)")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="container min-h-screen flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-4xl mb-4 flex">
        <Link href="/" className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex items-center">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </Link>
      </div>
      <Card className="mb-8 max-w-4xl w-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || `/placeholder.svg?height=80&width=80&query=${profile.full_name}`} />
            <AvatarFallback>{profile.full_name?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{profile.full_name}</CardTitle>
            <CardDescription>@{profile.username}</CardDescription>
            <p className="text-sm text-muted-foreground mt-1">Joined {formatDate(profile.created_at)}</p>
          </div>
          {isOwnProfile && (
            <div className="ml-auto">
              <Button asChild>
                <Link href="/profile/edit">Edit Profile</Link>
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">About</h3>
            <p>{profile.bio || "This user hasn't added a bio yet."}</p>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-muted rounded-md p-3">
              <div className="text-2xl font-bold">{postsWithVotes?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="bg-muted rounded-md p-3">
              <div className="text-2xl font-bold">{comments?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Comments</div>
            </div>
            <div className="bg-muted rounded-md p-3">
              <div className="text-2xl font-bold">{postsWithVotes?.reduce((sum, post) => sum + (post.total_votes || 0), 0) || 0}</div>
              <div className="text-sm text-muted-foreground">Reputation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl w-full">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            {postsWithVotes && postsWithVotes.length > 0 ? (
              <ul className="space-y-2">
                {postsWithVotes.slice(0, 5).map((post) => (
                  <li key={post.id} className="border-b pb-2 last:border-0">
                    <Link href={`/post/${post.slug}`} className="hover:underline font-medium">
                      {post.title}
                    </Link>
                    <div className="flex text-sm text-muted-foreground gap-4">
                      <span>{formatDate(post.created_at)}</span>
                      <span>{post.views || 0} views</span>
                      <span>{post.total_votes || 0} votes</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">This user hasn't created any posts yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {comments && comments.length > 0 ? (
              <ul className="space-y-2">
                {comments.map((comment) => (
                  <li key={comment.id} className="border-b pb-2 last:border-0">
                    <div className="line-clamp-2">{comment.content}</div>
                    <div className="flex text-sm text-muted-foreground gap-2">
                      <span>{formatDate(comment.created_at)}</span>
                      <span>on</span>
                      <Link href={`/post/${comment.post_id}`} className="hover:underline truncate">
                        {(comment.posts as any)?.title || "Unknown Post"}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">This user hasn't commented on any posts yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
