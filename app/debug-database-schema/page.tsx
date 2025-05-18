import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugDatabaseSchemaPage() {
  try {
    const supabase = createServerClient()

    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `)

    // Get columns for each table
    const tablesWithColumns = await Promise.all(
      (tables?.data || []).map(async (table) => {
        const { data: columns, error: columnsError } = await supabase
          .from("_sql")
          .select("*")
          .execute(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = '${table.table_name}'
            ORDER BY ordinal_position
          `)

        return {
          name: table.table_name,
          columns: columns?.data || [],
          error: columnsError?.message,
        }
      }),
    )

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Database Schema</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Tables and Columns</h2>

          {tablesError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {tablesError.message}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {tablesWithColumns.map((table) => (
                <div key={table.name} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-lg border-b pb-2 mb-4">{table.name}</h3>

                  {table.error ? (
                    <p className="text-red-500">Error: {table.error}</p>
                  ) : (
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Column</th>
                          <th className="px-4 py-2 text-left">Type</th>
                          <th className="px-4 py-2 text-left">Nullable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.columns.map((column, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                            <td className="px-4 py-2">{column.column_name}</td>
                            <td className="px-4 py-2">{column.data_type}</td>
                            <td className="px-4 py-2">{column.is_nullable}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
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
    console.error("Unexpected error in DebugDatabaseSchemaPage:", error)
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
