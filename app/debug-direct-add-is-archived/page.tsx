import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugDirectAddIsArchivedPage() {
  try {
    const supabase = createServerClient()

    // Execute SQL to add is_archived column
    const { data, error } = await supabase
      .from("_sql")
      .select("*")
      .execute("ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE")

    // Check if column exists
    const { data: columnCheck, error: columnError } = await supabase
      .from("_sql")
      .select("*")
      .execute(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_archived'",
      )

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Direct Add is_archived Column</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Add is_archived Column</h2>

          {error ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {error.message}</p>
            </div>
          ) : (
            <div className="bg-green-100 p-4 rounded">
              <p className="text-green-700">SQL executed successfully!</p>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Check Column Exists</h2>

          {columnError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {columnError.message}</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded">
              <p>
                Column check result:{" "}
                {columnCheck && columnCheck.length > 0
                  ? "Column 'is_archived' exists!"
                  : "Column 'is_archived' does not exist."}
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-96">
                {JSON.stringify(columnCheck, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-supabase" className="text-blue-500 hover:underline">
            Check Supabase
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugDirectAddIsArchivedPage:", error)
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
