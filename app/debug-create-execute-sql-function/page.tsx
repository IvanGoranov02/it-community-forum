import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCreateExecuteSqlFunctionPage() {
  const supabase = createServerClient()
  let result = { success: false, message: "", error: null }

  try {
    // SQL заявка за създаване на функцията
    const sql = `
      CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql_query;
      END;
      $$;
    `

    // Изпълняваме SQL заявката директно
    const { data, error } = await supabase.from("_sql").select("*").execute(sql)

    if (error) {
      result = {
        success: false,
        message: "Error creating execute_sql function",
        error,
      }
    } else {
      result = {
        success: true,
        message: "Successfully created execute_sql function",
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
      <h1 className="text-3xl font-bold mb-6">Create execute_sql Function</h1>

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
        <Link href="/debug-create-column-exists-function" className="text-blue-500 hover:underline">
          Create column_exists Function
        </Link>
      </div>
    </div>
  )
}
