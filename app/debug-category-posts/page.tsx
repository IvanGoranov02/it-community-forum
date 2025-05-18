import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCategoryPostsPage() {
  try {
    const supabase = createServerClient()

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

    // For each category, get posts
    const categoriesWithPosts = await Promise.all(
      (categories || []).map(async (category) => {
        const { data: posts, error } = await supabase
          .from("posts")
          .select("id, title, slug")
          .eq("category_id", category.id)
          .limit(5)

        return {
          ...category,
          posts: posts || [],
          postCount: posts?.length || 0,
          error: error?.message,
        }
      }),
    )

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Category Posts</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Categories with Posts</h2>

          <div className="space-y-6">
            {categoriesWithPosts.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-lg">{category.name}</h3>
                <p>Slug: {category.slug}</p>
                <p className="font-bold">Post Count: {category.postCount}</p>
                {category.error && <p className="text-red-500">Error: {category.error}</p>}

                {category.posts.length > 0 ? (
                  <div className="mt-2">
                    <h4 className="font-medium">Posts:</h4>
                    <ul className="list-disc pl-5 mt-1">
                      {category.posts.map((post) => (
                        <li key={post.id}>
                          <Link href={`/post/${post.slug}`} className="text-blue-500 hover:underline">
                            {post.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-2 text-gray-500">No posts in this category</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-category-counts" className="text-blue-500 hover:underline">
            Check Category Counts
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugCategoryPostsPage:", error)
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
