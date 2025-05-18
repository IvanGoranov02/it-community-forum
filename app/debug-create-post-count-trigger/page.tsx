import { createServerClient } from "@/lib/supabase"
import Link from "next/link"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

export default async function DebugCreatePostCountTriggerPage() {
  try {
    const supabase = createServerClient()

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "app", "sql", "create-post-count-trigger.sql")
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL
    const { data, error } = await supabase.rpc("execute_sql", { sql_query: sqlContent })

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Create Post Count Trigger</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">SQL Execution Result</h2>

          {error ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {error.message}</p>
            </div>
          ) : (
            <div className="bg-green-100 p-4 rounded">
              <p className="text-green-700">SQL executed successfully!</p>
              <pre className="mt-4 bg-white p-4 rounded overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">SQL Content</h2>
          <pre className="bg-white p-4 rounded overflow-auto max-h-96">{sqlContent}</pre>
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-run-update-counts" className="text-blue-500 hover:underline">
            Run Update Counts
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugCreatePostCountTriggerPage:", error)
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
