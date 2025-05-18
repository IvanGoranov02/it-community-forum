import { createServerClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { DebugInfo } from "@/components/debug-info"

export const dynamic = "force-dynamic"

export default async function AddIsArchivedDirectPage() {
  const supabase = createServerClient()

  // Add is_archived column directly
  const addColumnQuery = `
    ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;
  `

  const { data: migrationResult, error: migrationError } = await supabase
    .from("_sql")
    .select("*")
    .execute(addColumnQuery)

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Add is_archived Column (Direct)</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Migration Result</CardTitle>
          <CardDescription>Result of adding the is_archived column</CardDescription>
        </CardHeader>
        <CardContent>
          {migrationError ? (
            <p className="text-red-500">Error adding column: {migrationError.message}</p>
          ) : (
            <p className="text-green-500">The is_archived column was successfully added to the posts table.</p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Link href="/debug">
          <Button variant="outline">Back to Debug</Button>
        </Link>
        <Link href="/my-posts">
          <Button>Go to My Posts</Button>
        </Link>
      </div>

      <div className="mt-8">
        <DebugInfo title="Migration Result">
          <pre>{JSON.stringify({ migrationResult, migrationError }, null, 2)}</pre>
        </DebugInfo>
      </div>
    </div>
  )
}
