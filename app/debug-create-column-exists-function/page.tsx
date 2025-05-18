import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCreateColumnExistsFunctionPage() {
  const supabase = createServerClient()
  let result = { success: false, message: "", error: null }

  try {
    // SQL заявка за създаване на функцията
    const sql = `
      CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
      RETURNS boolean
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        column_exists boolean;
      BEGIN
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = $1
          AND column_name = $2
        ) INTO column_exists;
        
        RETURN column_exists;
      END;
      $$;
    `

    // Изпълняваме SQL заявката
    const { data, error } = await supabase.rpc("execute_sql", {
      sql_query: sql,
    })

    if (error) {
      result = {
        success: false,
        message: "Error creating column_exists function",
        error,
      }
    } else {
      result = {
        success: true,
        message: "Successfully created column_exists function",
        error: null,
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
      <h1 className="text-3xl font-bold mb-6">Create column_exists Function</h1>

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
