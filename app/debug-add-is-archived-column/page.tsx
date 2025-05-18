import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugAddIsArchivedColumnPage() {
  const supabase = createServerClient()
  let result = { success: false, message: "", error: null }

  try {
    // Проверяваме дали колоната вече съществува
    const { data: checkData, error: checkError } = await supabase.rpc("column_exists", {
      table_name: "posts",
      column_name: "is_archived",
    })

    if (checkError) {
      result = {
        success: false,
        message: "Error checking if column exists",
        error: checkError,
      }
    } else if (checkData) {
      result = {
        success: true,
        message: "Column is_archived already exists in posts table",
        error: null,
      }
    } else {
      // Добавяме колоната is_archived
      const { data, error } = await supabase.rpc("execute_sql", {
        sql_query: `
          ALTER TABLE posts 
          ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
        `,
      })

      if (error) {
        result = {
          success: false,
          message: "Error adding is_archived column",
          error,
        }
      } else {
        result = {
          success: true,
          message: "Successfully added is_archived column to posts table",
          error: null,
        }
      }
    }
  } catch (error) {
    result = {
      success: false,
      message: "Unexpected error",
      error,
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Add is_archived Column to Posts Table</h1>

      <div className={`p-4 rounded-lg mb-6 ${result.success ? "bg-green-100" : "bg-red-100"}`}>
        <h2 className="text-xl font-semibold mb-2">Result</h2>
        <p className={result.success ? "text-green-700" : "text-red-700"}>{result.message}</p>
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
        <Link href="/debug-check-is-archived" className="text-blue-500 hover:underline">
          Check is_archived Column
        </Link>
      </div>
    </div>
  )
}
