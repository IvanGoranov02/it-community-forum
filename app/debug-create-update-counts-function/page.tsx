import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugCreateUpdateCountsFunctionPage() {
  try {
    const supabase = createServerClient()

    // Get SQL function definition
    const sqlFunction = `
CREATE OR REPLACE FUNCTION update_category_post_counts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE categories c
  SET post_count = (
    SELECT COUNT(*)
    FROM posts p
    WHERE p.category_id = c.id
    AND (p.is_archived = false OR p.is_archived IS NULL)
  );
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
      AND routine_name = 'update_category_post_counts'
    `)

    // Execute the function
    const { data: executeData, error: executeError } = await supabase.rpc("update_category_post_counts")

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Create update_category_post_counts Function</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Create Function</h2>

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
                  ? "Function 'update_category_post_counts' exists!"
                  : "Function 'update_category_post_counts' does not exist."}
              </p>
              <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-96">
                {JSON.stringify(functionCheck, null, 2)}
              </pre>
            </div>
          )}
        </div>

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

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-update-category-counts" className="text-blue-500 hover:underline">
            Update Category Counts Manually
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugCreateUpdateCountsFunctionPage:", error)
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
