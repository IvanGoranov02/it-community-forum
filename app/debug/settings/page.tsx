import { getUser } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugSettingsPage() {
  const user = await getUser()
  const supabase = createServerClient()

  // Проверяваме дали таблицата user_settings съществува
  const { data: tableExists, error: tableError } = await supabase.rpc("check_table_exists", {
    table_name: "user_settings",
  })

  // Извличаме всички настройки
  const { data: allSettings, error: settingsError } = await supabase.from("user_settings").select("*")

  // Извличаме настройките на текущия потребител
  const { data: userSettings, error: userSettingsError } = user
    ? await supabase.from("user_settings").select("*").eq("user_id", user.id).single()
    : { data: null, error: null }

  // Извличаме сесията
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Debug Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User</CardTitle>
            <CardDescription>Current user information</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(user, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>Current session information</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(session, null, 2)}</pre>
            {sessionError && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                <h3 className="font-bold">Error:</h3>
                <pre>{JSON.stringify(sessionError, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table Status</CardTitle>
            <CardDescription>Check if user_settings table exists</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              Table user_settings exists: <strong>{tableExists ? "Yes" : "No"}</strong>
            </p>
            {tableError && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                <h3 className="font-bold">Error:</h3>
                <pre>{JSON.stringify(tableError, null, 2)}</pre>
              </div>
            )}
            <div className="mt-4">
              <Button asChild>
                <Link href="/api/create-settings-table">Create Table</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>Current user settings</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(userSettings, null, 2)}</pre>
            {userSettingsError && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                <h3 className="font-bold">Error:</h3>
                <pre>{JSON.stringify(userSettingsError, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Settings</CardTitle>
            <CardDescription>All settings in the database</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(allSettings, null, 2)}</pre>
            {settingsError && (
              <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                <h3 className="font-bold">Error:</h3>
                <pre>{JSON.stringify(settingsError, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
