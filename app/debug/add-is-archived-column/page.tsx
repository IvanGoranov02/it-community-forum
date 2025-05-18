import { createServerClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { DebugInfo } from "@/components/debug-info"

export const dynamic = "force-dynamic"

export default async function AddIsArchivedColumnPage() {
  const supabase = createServerClient()

  // Check if column exists directly with SQL
  const checkColumnQuery = `
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'posts' AND column_name = 'is_archived'
    ) as column_exists;
  `

  const { data: columnCheckResult, error: checkError } = await supabase
    .from("_sql")
    .select("*")
    .execute(checkColumnQuery)
  const columnExists = columnCheckResult?.[0]?.column_exists || false

  // Add column if it doesn't exist
  let migrationResult = null
  let migrationError = null

  if (!columnExists) {
    const addColumnQuery = `
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
    `

    const { data, error } = await supabase.from("_sql").select("*").execute(addColumnQuery)
    migrationResult = data
    migrationError = error
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Add is_archived Column</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Column Status</CardTitle>
          <CardDescription>Check if the is_archived column exists in the posts table</CardDescription>
        </CardHeader>
        <CardContent>
          {checkError ? (
            <p className="text-red-500">Error checking column: {checkError.message}</p>
          ) : (
            <p>The is_archived column {columnExists ? "already exists" : "does not exist"} in the posts table.</p>
          )}
        </CardContent>
      </Card>

      {!columnExists && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Migration Result</CardTitle>
            <CardDescription>Result of adding the is_archived column</CardDescription>
          </CardHeader>
          <CardContent>
            {migrationError ? (
              <p className="text-red-500">Error adding column: {migrationError.message}</p>
            ) : (
              <p className="text-green-500">
                {migrationResult === null
                  ? "Migration not executed yet."
                  : "The is_archived column was successfully added to the posts table."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Link href="/debug">
          <Button variant="outline">Back to Debug</Button>
        </Link>
        <Link href="/my-posts">
          <Button>Go to My Posts</Button>
        </Link>
      </div>

      <div className="mt-8">
        <DebugInfo title="Column Check Result">
          <pre>{JSON.stringify({ columnExists, checkError, columnCheckResult }, null, 2)}</pre>
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
