import { createServerClient } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function DebugFilterArchivedPage({
  searchParams,
}: {
  searchParams: { showArchived?: string }
}) {
  try {
    const supabase = createServerClient()
    const showArchived = searchParams.showArchived === "true"

    // Get posts with or without archived
    let query = supabase.from("posts").select("*")

    if (!showArchived) {
      query = query.eq("is_archived", false)
    }

    const { data: posts, error: postsError } = await query.limit(20)

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Filter Archived Posts</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Filter Options</h2>
          <div className="flex space-x-4">
            <Link href="/debug-filter-archived?showArchived=false">
              <Button variant={!showArchived ? "default" : "outline"}>Hide Archived</Button>
            </Link>
            <Link href="/debug-filter-archived?showArchived=true">
              <Button variant={showArchived ? "default" : "outline"}>Show All</Button>
            </Link>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Posts {!showArchived ? "(Excluding Archived)" : "(Including Archived)"}
          </h2>

          {postsError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {postsError.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="font-medium">Found {posts?.length || 0} posts</p>
              {posts?.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-lg">{post.title}</h3>
                  <p>ID: {post.id}</p>
                  <p>Archived: {post.is_archived ? "Yes" : "No"}</p>
                  <div className="flex space-x-2 mt-2">
                    <Link href={`/debug-archive-post?id=${post.id}&action=archive`}>
                      <Button variant="destructive" size="sm" disabled={post.is_archived}>
                        Archive
                      </Button>
                    </Link>
                    <Link href={`/debug-archive-post?id=${post.id}&action=unarchive`}>
                      <Button variant="outline" size="sm" disabled={!post.is_archived}>
                        Unarchive
                      </Button>
                    </Link>
                    <Link href={`/post/${post.slug}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-archive-post" className="text-blue-500 hover:underline">
            Archive Posts
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugFilterArchivedPage:", error)
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-500">An unexpected error occurred</p>
        <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto max-h-96">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    )
  }
}
