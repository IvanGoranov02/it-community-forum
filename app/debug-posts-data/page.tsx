import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugPostsDataPage() {
  try {
    const supabase = createServerClient()

    // Add is_archived column if it doesn't exist
    const { data: columnExists, error: columnError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'posts' AND column_name = 'is_archived'
      `)

    const hasIsArchivedColumn = columnExists?.data?.length > 0

    // Add the column if it doesn't exist
    if (!hasIsArchivedColumn) {
      const { error: addColumnError } = await supabase
        .from("_sql")
        .select("*")
        .execute(`
          ALTER TABLE posts ADD COLUMN is_archived BOOLEAN DEFAULT false;
        `)

      if (addColumnError) {
        console.error("Error adding is_archived column:", addColumnError)
      }
    }

    // Get posts with pagination
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select(`
        id,
        title,
        slug,
        created_at,
        updated_at,
        author_id,
        category_id,
        is_archived,
        views,
        author:profiles(username),
        category:categories(name)
      `)
      .order("created_at", { ascending: false })
      .limit(20)

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Posts Data</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Posts</h2>

          {columnError ? (
            <div className="bg-red-100 p-4 rounded mb-4">
              <p className="text-red-700">Column Check Error: {columnError.message}</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded shadow mb-4">
              <h3 className="font-medium text-lg mb-4">Column Status</h3>
              <p>
                is_archived column exists: <strong>{hasIsArchivedColumn ? "Yes" : "No"}</strong>
              </p>
              {!hasIsArchivedColumn && <p className="text-green-600 mt-2">Column was added automatically</p>}
            </div>
          )}

          {postsError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {postsError.message}</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded shadow overflow-x-auto">
              <h3 className="font-medium text-lg mb-4">Posts Data (Latest 20)</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Author</th>
                    <th className="px-4 py-2 text-left">Category</th>
                    <th className="px-4 py-2 text-left">Views</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Archived</th>
                  </tr>
                </thead>
                <tbody>
                  {(posts || []).map((post, i) => (
                    <tr key={post.id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="px-4 py-2">{post.id}</td>
                      <td className="px-4 py-2">
                        <Link href={`/post/${post.slug}`} className="text-blue-500 hover:underline">
                          {post.title}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{post.author?.username}</td>
                      <td className="px-4 py-2">{post.category?.name}</td>
                      <td className="px-4 py-2">{post.views}</td>
                      <td className="px-4 py-2">{new Date(post.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        <span className={post.is_archived ? "text-red-500" : "text-green-500"}>
                          {post.is_archived ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-categories-data" className="text-blue-500 hover:underline">
            View Categories Data
          </Link>
          <Link href="/debug-test-archive" className="text-blue-500 hover:underline">
            Test Archive
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugPostsDataPage:", error)
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
