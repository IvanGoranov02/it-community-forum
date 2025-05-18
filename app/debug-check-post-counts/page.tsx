import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCheckPostCountsPage() {
  try {
    const supabase = createServerClient()

    // Get all categories with their post_count
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

    // For each category, count posts directly
    const categoriesWithCounts = await Promise.all(
      (categories || []).map(async (category) => {
        const { count, error } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("category_id", category.id)
          .eq("is_archived", false)

        return {
          ...category,
          storedCount: category.post_count || 0,
          actualCount: count || 0,
          isCorrect: (category.post_count || 0) === (count || 0),
          error: error?.message,
        }
      }),
    )

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Check Post Counts</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Categories with Post Counts</h2>

          {categoriesError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {categoriesError.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categoriesWithCounts.map((category) => (
                <div
                  key={category.id}
                  className={`p-4 rounded shadow ${category.isCorrect ? "bg-green-50" : "bg-red-50"}`}
                >
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  <p>ID: {category.id}</p>
                  <p>Slug: {category.slug}</p>
                  <p className="font-bold">
                    Stored Count: {category.storedCount} | Actual Count: {category.actualCount}
                  </p>
                  {!category.isCorrect && (
                    <p className="text-red-500 font-bold">
                      Counts don't match! Difference: {category.storedCount - category.actualCount}
                    </p>
                  )}
                  {category.error && <p className="text-red-500">Error: {category.error}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-run-update-counts" className="text-blue-500 hover:underline">
            Run Update Counts
          </Link>
          <Link href="/debug-create-post-count-trigger" className="text-blue-500 hover:underline">
            Create Post Count Trigger
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugCheckPostCountsPage:", error)
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
