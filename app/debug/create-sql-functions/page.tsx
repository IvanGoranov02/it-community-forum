import { createServerClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { DebugInfo } from "@/components/debug-info"

export const dynamic = "force-dynamic"

export default async function CreateSqlFunctionsPage() {
  const supabase = createServerClient()

  // Create column_exists function
  const columnExistsQuery = `
    CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
    RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = $1 AND column_name = $2
      );
    END;
    $$;
  `

  // Create execute_sql function
  const executeSqlQuery = `
    CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
    RETURNS boolean
    LANGUAGE plpgsql
    AS $$
    BEGIN
      EXECUTE sql_query;
      RETURN true;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE;
    END;
    $$;
  `

  // Execute the SQL queries directly
  const { data: columnExistsResult, error: columnExistsError } = await supabase
    .from("_sql")
    .select("*")
    .execute(columnExistsQuery)
  const { data: executeSqlResult, error: executeSqlError } = await supabase
    .from("_sql")
    .select("*")
    .execute(executeSqlQuery)

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Create SQL Functions</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>column_exists Function</CardTitle>
          <CardDescription>Create a function to check if a column exists in a table</CardDescription>
        </CardHeader>
        <CardContent>
          {columnExistsError ? (
            <p className="text-red-500">Error creating function: {columnExistsError.message}</p>
          ) : (
            <p className="text-green-500">The column_exists function was successfully created.</p>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>execute_sql Function</CardTitle>
          <CardDescription>Create a function to execute SQL queries</CardDescription>
        </CardHeader>
        <CardContent>
          {executeSqlError ? (
            <p className="text-red-500">Error creating function: {executeSqlError.message}</p>
          ) : (
            <p className="text-green-500">The execute_sql function was successfully created.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/debug">
          <Button variant="outline">Back to Debug</Button>
        </Link>
        <Link href="/debug/add-is-archived-column">
          <Button>Add is_archived Column</Button>
        </Link>
      </div>

      <div className="mt-8">
        <DebugInfo title="column_exists Result">
          <pre>{JSON.stringify({ columnExistsResult, columnExistsError }, null, 2)}</pre>
        </DebugInfo>
        <DebugInfo title="execute_sql Result">
          <pre>{JSON.stringify({ executeSqlResult, executeSqlError }, null, 2)}</pre>
        </DebugInfo>
      </div>
    </div>
  )
}
