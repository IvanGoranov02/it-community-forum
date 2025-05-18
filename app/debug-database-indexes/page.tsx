import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugDatabaseIndexesPage() {
  try {
    const supabase = createServerClient()

    // Get all indexes
    const { data: indexes, error: indexesError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
        SELECT
          t.relname AS table_name,
          i.relname AS index_name,
          a.attname AS column_name,
          ix.indisunique AS is_unique,
          ix.indisprimary AS is_primary
        FROM
          pg_class t,
          pg_class i,
          pg_index ix,
          pg_attribute a,
          pg_namespace n
        WHERE
          t.oid = ix.indrelid
          AND i.oid = ix.indexrelid
          AND a.attrelid = t.oid
          AND a.attnum = ANY(ix.indkey)
          AND t.relkind = 'r'
          AND t.relnamespace = n.oid
          AND n.nspname = 'public'
        ORDER BY
          t.relname,
          i.relname,
          a.attnum
      `)

    // Group indexes by table and index name
    const groupedIndexes = (indexes?.data || []).reduce((acc, index) => {
      const key = `${index.table_name}:${index.index_name}`
      if (!acc[key]) {
        acc[key] = {
          table_name: index.table_name,
          index_name: index.index_name,
          is_unique: index.is_unique,
          is_primary: index.is_primary,
          columns: [],
        }
      }
      acc[key].columns.push(index.column_name)
      return acc
    }, {})

    const indexList = Object.values(groupedIndexes)

    // Group indexes by table
    const tableIndexes = indexList.reduce((acc, index) => {
      if (!acc[index.table_name]) {
        acc[index.table_name] = []
      }
      acc[index.table_name].push(index)
      return acc
    }, {})

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Database Indexes</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Indexes by Table</h2>

          {indexesError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {indexesError.message}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(tableIndexes).map(([tableName, indexes]) => (
                <div key={tableName} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-lg border-b pb-2 mb-4">{tableName}</h3>

                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Index Name</th>
                        <th className="px-4 py-2 text-left">Columns</th>
                        <th className="px-4 py-2 text-left">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indexes.map((index, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                          <td className="px-4 py-2">{index.index_name}</td>
                          <td className="px-4 py-2">{index.columns.join(", ")}</td>
                          <td className="px-4 py-2">
                            {index.is_primary ? "PRIMARY KEY" : index.is_unique ? "UNIQUE" : "INDEX"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-database-schema" className="text-blue-500 hover:underline">
            View Database Schema
          </Link>
          <Link href="/debug-database-functions" className="text-blue-500 hover:underline">
            View Database Functions
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugDatabaseIndexesPage:", error)
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
