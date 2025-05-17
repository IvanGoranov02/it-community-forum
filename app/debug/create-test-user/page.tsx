"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function CreateTestUserPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateUser = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/create-test-user")
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Test User</CardTitle>
          <CardDescription>Create a test user for login testing</CardDescription>
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

          {result && (
            <div
              className={`mt-4 p-4 rounded-md ${
                result.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              {result.error ? (
                <p>Error: {result.error}</p>
              ) : (
                <>
                  <p>{result.message || "User created successfully!"}</p>
                  {result.user && (
                    <div className="mt-2">
                      <p>
                        <strong>Email:</strong> {result.user.email}
                      </p>
                      <p>
                        <strong>Password:</strong> {result.user.password}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href="/debug/login">
            <Button variant="outline">Back to Login Debug</Button>
          </Link>
          <Button onClick={handleCreateUser} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Test User"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
