import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugDatabaseFunctionsPage() {
  try {
    const supabase = createServerClient()

    // Get all functions
    const { data: functions, error: functionsError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
        SELECT 
          p.proname AS function_name,
          pg_get_functiondef(p.oid) AS function_definition
        FROM 
          pg_proc p
          JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE 
          n.nspname = 'public'
        ORDER BY 
          p.proname
      `)

    // Get all triggers
    const { data: triggers, error: triggersError } = await supabase
      .from("_sql")
      .select("*")
      .execute(`
        SELECT 
          t.tgname AS trigger_name,
          c.relname AS table_name,
          pg_get_triggerdef(t.oid) AS trigger_definition
        FROM 
          pg_trigger t
          JOIN pg_class c ON t.tgrelid = c.oid
          JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE 
          n.nspname = 'public'
          AND NOT t.tgisinternal
        ORDER BY 
          c.relname, t.tgname
      `)

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Database Functions and Triggers</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Functions</h2>

          {functionsError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {functionsError.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {functions?.data?.map((func, index) => (
                <div key={index} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-lg">{func.function_name}</h3>
                  <pre className="mt-2 bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
                    {func.function_definition}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Triggers</h2>

          {triggersError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {triggersError.message}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {triggers?.data?.map((trigger, index) => (
                <div key={index} className="bg-white p-4 rounded shadow">
                  <h3 className="font-medium text-lg">{trigger.trigger_name}</h3>
                  <p className="text-gray-600">Table: {trigger.table_name}</p>
                  <pre className="mt-2 bg-gray-50 p-4 rounded overflow-auto max-h-96 text-sm">
                    {trigger.trigger_definition}
                  </pre>
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
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugDatabaseFunctionsPage:", error)
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
