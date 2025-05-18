import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCategoryPostCountsPage() {
  const supabase = createServerClient()
  let categories = []
  let error = null

  try {
    // Извличаме категориите
    const { data: categoriesData, error: categoriesError } = await supabase.from("categories").select("*").order("name")

    if (categoriesError) {
      error = categoriesError
    } else {
      // За всяка категория извличаме броя на постовете
      categories = await Promise.all(
        categoriesData.map(async (category) => {
          // Извличаме броя на постовете
          const { count, error: postError } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id)

          return {
            ...category,
            postCount: count || 0,
            error: postError?.message,
          }
        }),
      )
    }
  } catch (err) {
    error = err
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Debug Category Post Counts</h1>

      {error ? (
        <div className="bg-red-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Error</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">{JSON.stringify(error, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Categories with Post Counts</h2>

          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-lg">{category.name}</h3>
                <p>ID: {category.id}</p>
                <p>Slug: {category.slug}</p>
                <p className="font-bold">Post Count: {category.postCount}</p>
                {category.error && <p className="text-red-500">Error: {category.error}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
        <Link href="/debug-add-is-archived-column" className="text-blue-500 hover:underline">
          Add is_archived Column
        </Link>
      </div>
    </div>
  )
}
