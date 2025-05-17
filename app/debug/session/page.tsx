"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function DebugSessionPage() {
  const [session, setSession] = useState<any>(null)
  const [cookies, setCookies] = useState<string>("")
  const [error, setError] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie)

    // Get session from Supabase
    const fetchSession = async () => {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setError(error.message)
        } else {
          setSession(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    }

    fetchSession()
  }, [])

  const handleClearCookies = () => {
    // Clear auth cookie
    document.cookie = "supabase-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    setCookies("")
    setSession(null)
    router.refresh()
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Debug</CardTitle>
          <CardDescription>Information about your current session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Session Status</h3>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono whitespace-pre-wrap">
                {session ? JSON.stringify(session, null, 2) : "No session found"}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Cookies</h3>
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono whitespace-pre-wrap">
                {cookies || "No cookies found"}
              </div>
            </div>

            {error && (
              <div>
                <h3 className="font-medium mb-2 text-red-500">Error</h3>
                <div className="p-4 bg-red-100 dark:bg-red-900 rounded text-xs font-mono whitespace-pre-wrap">
                  {error}
                </div>
              </div>
            )}

            <Button onClick={handleClearCookies} variant="destructive">
              Clear Auth Cookies
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
