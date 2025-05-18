import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugUpdateCategoryCountsPage() {
  try {
    const supabase = createServerClient()

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

    // For each category, count active posts and update the category
    const updatedCategories = await Promise.all(
      (categories || []).map(async (category) => {
        // Count active posts
        const { data: countData, error: countError } = await supabase
          .from("_sql")
          .select("*")
          .execute(`
          SELECT COUNT(*) as post_count 
          FROM posts 
          WHERE category_id = '${category.id}'
          AND (is_archived = false OR is_archived IS NULL)
        `)

        const postCount = countData?.[0]?.post_count || 0

        // Update category with post count
        const { data: updateData, error: updateError } = await supabase
          .from("categories")
          .update({ post_count: postCount })
          .eq("id", category.id)
          .select()

        return {
          ...category,
          postCount,
          countError: countError?.message,
          updateError: updateError?.message,
        }
      }),
    )

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Update Category Post Counts</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Updated Categories</h2>

          {categoriesError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {categoriesError.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {updatedCategories.map((category) => (
                <div key={category.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  <p>ID: {category.id}</p>
                  <p>Slug: {category.slug}</p>
                  <p className="font-bold">Updated Post Count: {category.postCount}</p>
                  {category.countError && <p className="text-red-500">Count Error: {category.countError}</p>}
                  {category.updateError && <p className="text-red-500">Update Error: {category.updateError}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-count-active-posts" className="text-blue-500 hover:underline">
            View Active Post Counts
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugUpdateCategoryCountsPage:", error)
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
