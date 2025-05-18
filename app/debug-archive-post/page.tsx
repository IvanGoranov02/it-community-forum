import { createServerClient } from "@/lib/supabase"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function DebugArchivePostPage({
  searchParams,
}: {
  searchParams: { id?: string; action?: string }
}) {
  try {
    const supabase = createServerClient()
    const postId = searchParams.id
    const action = searchParams.action

    let actionResult = null
    let actionError = null

    // If post ID and action are provided, perform the action
    if (postId && action) {
      if (action === "archive") {
        const { data, error } = await supabase.from("posts").update({ is_archived: true }).eq("id", postId).select()
        actionResult = data
        actionError = error
      } else if (action === "unarchive") {
        const { data, error } = await supabase.from("posts").update({ is_archived: false }).eq("id", postId).select()
        actionResult = data
        actionError = error
      }
    }

    // Get sample posts
    const { data: posts, error: postsError } = await supabase.from("posts").select("*").limit(10)

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Archive Post</h1>

        {actionResult && (
          <div className="bg-green-100 p-4 rounded mb-6">
            <p className="text-green-700">Action performed successfully!</p>
            <pre className="bg-white p-2 rounded mt-2 overflow-auto max-h-96">
              {JSON.stringify(actionResult, null, 2)}
            </pre>
          </div>
        )}

        {actionError && (
          <div className="bg-red-100 p-4 rounded mb-6">
            <p className="text-red-700">Error: {actionError.message}</p>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Posts</h2>

          {postsError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {postsError.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
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
          <Link href="/debug-check-is-archived" className="text-blue-500 hover:underline">
            Check is_archived Column
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugArchivePostPage:", error)
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
