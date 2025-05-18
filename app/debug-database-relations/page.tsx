import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugDatabaseRelationsPage() {
  try {
    const supabase = createServerClient()

    // Get all foreign keys
    const { data: relations, error: relationsError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
        SELECT
          tc.table_schema, 
          tc.constraint_name, 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_schema AS foreign_table_schema,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
        ORDER BY tc.table_name, kcu.column_name
      `)

    // Group relations by table
    const tableRelations = (relations?.data || []).reduce((acc, relation) => {
      if (!acc[relation.table_name]) {
        acc[relation.table_name] = []
      }
      acc[relation.table_name].push(relation)
      return acc
    }, {})

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Database Relations</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Foreign Key Relationships</h2>

          {relationsError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {relationsError.message}</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(tableRelations).map(([tableName, relations]) => (
                <div key={tableName} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-lg border-b pb-2 mb-4">{tableName}</h3>

                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left">Column</th>
                        <th className="px-4 py-2 text-left">References</th>
                        <th className="px-4 py-2 text-left">Constraint Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relations.map((relation, i) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                          <td className="px-4 py-2">{relation.column_name}</td>
                          <td className="px-4 py-2">
                            {relation.foreign_table_name}.{relation.foreign_column_name}
                          </td>
                          <td className="px-4 py-2">{relation.constraint_name}</td>
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
          <Link href="/debug-database-indexes" className="text-blue-500 hover:underline">
            View Database Indexes
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugDatabaseRelationsPage:", error)
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
