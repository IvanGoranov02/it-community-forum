import { createServerClient } from "@/lib/supabase"
import Link from "next/link"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function DebugTestArchivePage() {
  const supabase = createServerClient()

  // Get a list of posts
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, title, is_archived, category_id, category:categories(name)")
    .order("created_at", { ascending: false })
    .limit(10)

  // Function to archive a post
  async function archivePost(formData: FormData) {
    "use server"

    const postId = formData.get("postId") as string
    const supabase = createServerClient()

    const { error } = await supabase.from("posts").update({ is_archived: true }).eq("id", postId)

    if (error) {
      console.error("Error archiving post:", error)
    }

    revalidatePath("/debug-test-archive")
  }

  // Function to unarchive a post
  async function unarchivePost(formData: FormData) {
    "use server"

    const postId = formData.get("postId") as string
    const supabase = createServerClient()

    const { error } = await supabase.from("posts").update({ is_archived: false }).eq("id", postId)

    if (error) {
      console.error("Error unarchiving post:", error)
    }

    revalidatePath("/debug-test-archive")
  }

  // Get category counts before and after filtering
  const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      // Count all posts
      const { count: totalCount, error: totalError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)

      // Count non-archived posts
      const { count: activeCount, error: activeError } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("category_id", category.id)
        .eq("is_archived", false)

      return {
        ...category,
        totalCount: totalCount || 0,
        activeCount: activeCount || 0,
        storedCount: category.post_count || 0,
        totalError: totalError?.message,
        activeError: activeError?.message,
      }
    }),
  )

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Debug Test Archive</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Category Counts</h2>

        {categoriesError ? (
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-700">Error: {categoriesError.message}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categoriesWithCounts.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-lg">{category.name}</h3>
                <p>ID: {category.id}</p>
                <p>Stored Count: {category.storedCount}</p>
                <p>Total Posts: {category.totalCount}</p>
                <p className="font-bold">Active Posts: {category.activeCount}</p>
                {category.totalError && <p className="text-red-500">Total Error: {category.totalError}</p>}
                {category.activeError && <p className="text-red-500">Active Error: {category.activeError}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>

        {postsError ? (
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-700">Error: {postsError.message}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts?.map((post) => (
              <div key={post.id} className={`p-4 rounded shadow ${post.is_archived ? "bg-red-50" : "bg-green-50"}`}>
                <h3 className="font-medium text-lg">{post.title}</h3>
                <p>ID: {post.id}</p>
                <p>Category: {post.category?.name}</p>
                <p className="font-bold">Status: {post.is_archived ? "Archived" : "Active"}</p>

                <div className="mt-4 flex space-x-4">
                  {!post.is_archived ? (
                    <form action={archivePost}>
                      <input type="hidden" name="postId" value={post.id} />
                      <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                        Archive
                      </button>
                    </form>
                  ) : (
                    <form action={unarchivePost}>
                      <input type="hidden" name="postId" value={post.id} />
                      <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                        Unarchive
                      </button>
                    </form>
                  )}
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
        <Link href="/debug-check-post-counts" className="text-blue-500 hover:underline">
          Check Post Counts
        </Link>
      </div>
    </div>
  )
}
