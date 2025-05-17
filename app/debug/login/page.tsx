"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function DebugLoginPage() {
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleCreateTestUser = async () => {
    router.push("/debug/create-test-user")
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setResponse(null)

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      setResponse(data)

      if (!res.ok) {
        setError(data.error || "Login failed")
      } else {
        // Wait a bit to show the success message
        setTimeout(() => {
          router.push("/")
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="w-full max-w-md mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Create Test User</CardTitle>
          <CardDescription>Create a test user with known credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This will create a test user with the following credentials:</p>
          <div className="bg-muted p-4 rounded-md mb-4">
            <p>
              <strong>Email:</strong> test@example.com
            </p>
            <p>
              <strong>Password:</strong> password123
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateTestUser}>Create Test User</Button>
        </CardFooter>
      </Card>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Debug Login</CardTitle>
          <CardDescription>Test login with detailed error reporting</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
            {response && response.success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                Login successful!
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {response && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Response Details:</h3>
                <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-60">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
