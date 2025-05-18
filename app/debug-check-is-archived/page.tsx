import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCheckIsArchivedPage() {
  const supabase = createServerClient()
  let result = { exists: false, message: "", error: null }

  try {
    // Проверяваме дали колоната съществува директно с SQL заявка
    const { data, error } = await supabase
      .from("_sql")
      .select("*")
      .execute(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'is_archived'",
      )

    if (error) {
      result = {
        exists: false,
        message: "Error checking if column exists",
        error,
      }
    } else {
      const columnExists = data && data.length > 0
      result = {
        exists: columnExists,
        message: columnExists
          ? "Column is_archived exists in posts table"
          : "Column is_archived does NOT exist in posts table",
        error: null,
      }
    }
  } catch (error) {
    result = {
      exists: false,
      message: "Unexpected error",
      error,
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Check is_archived Column in Posts Table</h1>

      <div className={`p-4 rounded-lg mb-6 ${result.exists ? "bg-green-100" : "bg-yellow-100"}`}>
        <h2 className="text-xl font-semibold mb-2">Result</h2>
        <p className={result.exists ? "text-green-700" : "text-yellow-700"}>{result.message}</p>
        {result.error && (
          <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto max-h-96">
            {JSON.stringify(result.error, null, 2)}
          </pre>
        )}
      </div>

      <div className="flex space-x-4">
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
        {!result.exists && (
          <Link href="/debug-add-is-archived-column" className="text-blue-500 hover:underline">
            Add is_archived Column
          </Link>
        )}
        <Link href="/new-post" className="text-blue-500 hover:underline">
          Create New Post
        </Link>
      </div>
    </div>
  )
}
