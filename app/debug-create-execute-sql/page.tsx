import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCreateExecuteSqlPage() {
  try {
    const supabase = createServerClient()

    // Get SQL function definition
    const sqlFunction = `
CREATE OR REPLACE FUNCTION execute_sql(sql_query TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  EXECUTE sql_query INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('error', SQLERRM);
END;
$$;
    `

    // Execute SQL to create function
    const { data, error } = await supabase.from("_sql").select("*").execute(sqlFunction)

    // Check if function exists
    const { data: functionCheck, error: functionError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_type = 'FUNCTION' 
      AND routine_name = 'execute_sql'
    `)

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Create execute_sql Function</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Create execute_sql Function</h2>

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
          <h2 className="text-xl font-semibold mb-4">Check Function Exists</h2>

          {functionError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {functionError.message}</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded">
              <p>
                Function check result:{" "}
                {functionCheck && functionCheck.length > 0
                  ? "Function 'execute_sql' exists!"
                  : "Function 'execute_sql' does not exist."}
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-96">
                {JSON.stringify(functionCheck, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-add-is-archived" className="text-blue-500 hover:underline">
            Add is_archived Column
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugCreateExecuteSqlPage:", error)
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
