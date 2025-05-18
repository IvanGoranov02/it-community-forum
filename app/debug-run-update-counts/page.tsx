import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugRunUpdateCountsPage() {
  try {
    const supabase = createServerClient()

    // Execute the function
    const { data: executeData, error: executeError } = await supabase.rpc("update_category_post_counts")

    // Get categories to check if counts were updated
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Run update_category_post_counts Function</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Execute Function</h2>

          {executeError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {executeError.message}</p>
            </div>
          ) : (
            <div className="bg-green-100 p-4 rounded">
              <p className="text-green-700">Function executed successfully!</p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Categories with Updated Counts</h2>

          {categoriesError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {categoriesError.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories?.map((category) => (
                <div key={category.id} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  <p>ID: {category.id}</p>
                  <p>Slug: {category.slug}</p>
                  <p className="font-bold">Post Count: {category.post_count || 0}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-create-update-counts-function" className="text-blue-500 hover:underline">
            Create Update Counts Function
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugRunUpdateCountsPage:", error)
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
