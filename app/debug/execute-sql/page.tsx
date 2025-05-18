import { createServerClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { DebugInfo } from "@/components/debug-info"
import { revalidatePath } from "next/cache"

export const dynamic = "force-dynamic"

export default async function ExecuteSqlPage({
  searchParams,
}: {
  searchParams: { query?: string }
}) {
  const supabase = createServerClient()
  const query = searchParams.query || ""

  let result = null
  let error = null

  async function executeSql(formData: FormData) {
    "use server"
    const query = formData.get("query") as string
    revalidatePath("/debug/execute-sql")
    return `/debug/execute-sql?query=${encodeURIComponent(query)}`
  }

  if (query) {
    try {
      const { data, error: sqlError } = await supabase.from("_sql").select("*").execute(query)
      result = data
      error = sqlError
    } catch (e: any) {
      error = { message: e.message }
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Execute SQL</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>SQL Query</CardTitle>
          <CardDescription>Enter an SQL query to execute</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={executeSql}>
            <Textarea name="query" placeholder="Enter SQL query here..." className="mb-4 h-32" defaultValue={query} />
            <Button type="submit">Execute</Button>
          </form>
        </CardContent>
      </Card>

      {query && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Result of executing the SQL query</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-red-500">Error executing query: {error.message}</p>
            ) : (
              <p className="text-green-500">Query executed successfully!</p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Link href="/debug">
          <Button variant="outline">Back to Debug</Button>
        </Link>
      </div>

      {result && (
        <div className="mt-8">
          <DebugInfo title="Query Result">
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </DebugInfo>
        </div>
      )}
    </div>
  )
}
