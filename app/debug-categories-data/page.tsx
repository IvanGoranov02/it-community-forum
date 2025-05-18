import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCategoriesDataPage() {
  try {
    const supabase = createServerClient()

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*")

    // Add post_count column if it doesn't exist
    const { data: columnExists, error: columnError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'categories' AND column_name = 'post_count'
      `)

    const hasPostCountColumn = columnExists?.data?.length > 0

    // Add the column if it doesn't exist
    if (!hasPostCountColumn) {
      const { error: addColumnError } = await supabase
        .from("_sql")
        .select("*")
        .execute(`
          ALTER TABLE categories ADD COLUMN post_count INTEGER DEFAULT 0;
          ALTER TABLE categories ADD COLUMN user_count INTEGER DEFAULT 0;
        `)

      if (addColumnError) {
        console.error("Error adding post_count column:", addColumnError)
      }
    }

    // Update post counts
    const { error: updateError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
        UPDATE categories c
        SET post_count = (
          SELECT COUNT(*)
          FROM posts p
          WHERE p.category_id = c.id
          AND (p.is_archived = false OR p.is_archived IS NULL)
        );
      `)

    if (updateError) {
      console.error("Error updating post counts:", updateError)
    }

    // Get updated categories
    const { data: updatedCategories, error: updatedError } = await supabase.from("categories").select("*")

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Categories Data</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>

          {categoriesError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {categoriesError.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-lg mb-4">Column Status</h3>
                <p>
                  post_count column exists: <strong>{hasPostCountColumn ? "Yes" : "No"}</strong>
                </p>
                {!hasPostCountColumn && <p className="text-green-600 mt-2">Column was added automatically</p>}
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-medium text-lg mb-4">Categories Data</h3>
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left">ID</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Slug</th>
                      <th className="px-4 py-2 text-left">Post Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(updatedCategories || categories || []).map((category, i) => (
                      <tr key={category.id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="px-4 py-2">{category.id}</td>
                        <td className="px-4 py-2">{category.name}</td>
                        <td className="px-4 py-2">{category.slug}</td>
                        <td className="px-4 py-2">{category.post_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
  } catch (error) {
    console.error("Unexpected error in DebugCategoriesDataPage:", error)
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
