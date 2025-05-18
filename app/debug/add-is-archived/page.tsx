import { createServerClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DebugInfo } from "@/components/debug-info"

export const dynamic = "force-dynamic"

export default async function AddIsArchivedPage() {
  const supabase = createServerClient()

  // Check if the column exists
  const { data: columnExists, error: checkError } = await supabase.rpc("column_exists", {
    table_name: "posts",
    column_name: "is_archived",
  })

  // Add the column if it doesn't exist
  let migrationResult = null
  let migrationError = null

  if (!columnExists) {
    const { data, error } = await supabase.rpc("run_sql", {
      sql_query: `
        ALTER TABLE posts ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;
      `,
    })
    migrationResult = data
    migrationError = error
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Add is_archived Column</CardTitle>
          <CardDescription>Add the is_archived column to the posts table</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Column Status</h3>
              {checkError ? (
                <p className="text-red-500">Error checking column: {checkError.message}</p>
              ) : (
                <p>The is_archived column {columnExists ? "already exists" : "does not exist"} in the posts table.</p>
              )}
            </div>

            {migrationResult !== null && (
              <div>
                <h3 className="text-lg font-medium">Migration Result</h3>
                {migrationError ? (
                  <p className="text-red-500">Error adding column: {migrationError.message}</p>
                ) : (
                  <p className="text-green-500">Column added successfully!</p>
                )}
              </div>
            )}

            <div className="pt-4">
              <Button asChild>
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <DebugInfo title="Column Check Result">
          <pre>{JSON.stringify({ columnExists, checkError }, null, 2)}</pre>
        </DebugInfo>

        {migrationResult !== null && (
          <DebugInfo title="Migration Result">
            <pre>{JSON.stringify({ migrationResult, migrationError }, null, 2)}</pre>
          </DebugInfo>
        )}
      </div>
    </div>
  )
}
