"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase"
import Link from "next/link"

// This is a client component, so we don't need to mark it as dynamic

export default function SqlCreateUserPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateUser = async () => {
    setIsLoading(true)
    try {
      const supabase = createBrowserClient()

      // First try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: "test@example.com",
        password: "password123",
        options: {
          data: {
            full_name: "Test User",
          },
        },
      })

      if (authError) {
        setResult({ error: authError.message })
        setIsLoading(false)
        return
      }

      // If user already exists, try to sign in
      if (!authData.user) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: "test@example.com",
          password: "password123",
        })

        if (signInError) {
          setResult({ error: signInError.message })
          setIsLoading(false)
          return
        }

        if (signInData.user) {
          setResult({
            success: true,
            message: "User already exists and credentials are valid",
            user: { email: "test@example.com", password: "password123" },
          })
          setIsLoading(false)
          return
        }
      }

      // Create profile if user was created
      if (authData.user) {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", authData.user.id)
          .single()

        if (!existingProfile) {
          // Create profile
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            username: "testuser",
            full_name: "Test User",
            role: "member",
            reputation: 0,
          })

          if (profileError) {
            setResult({ error: profileError.message })
            setIsLoading(false)
            return
          }
        }

        setResult({
          success: true,
          message: "User created successfully",
          user: { email: "test@example.com", password: "password123" },
        })
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : "An unexpected error occurred" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Test User with SQL</CardTitle>
          <CardDescription>Create a test user directly in the database</CardDescription>
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
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Button onClick={handleCreateUser} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Test User"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
