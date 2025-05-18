"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DebugInfo } from "@/components/debug-info"
import { useLoading } from "@/app/context/loading-context"

export default function CreateTestUserPage() {
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("test@example.com")
  const [password, setPassword] = useState("password123")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { startLoading, stopLoading } = useLoading()

  const handleCreateUser = async () => {
    startLoading("Creating test user...")
    setResult(null)
    setDebugInfo(null)

    try {
      // First check if user already exists by trying to sign in
      const supabase = createBrowserClient()
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!signInError && signInData.user) {
        // User already exists and credentials are valid
        setResult({
          success: true,
          message: "User already exists and credentials are valid",
          user: { email, password },
        })
        setDebugInfo({ existingUser: signInData.user })
        toast({
          title: "Success",
          description: "User already exists and credentials are valid",
        })
        return
      }

      // User doesn't exist or password is wrong, try to create a new one
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: "Test User",
          },
        },
      })

      if (signUpError) {
        setResult({ error: signUpError.message })
        setDebugInfo({ signUpError })
        toast({
          title: "Error",
          description: signUpError.message,
          variant: "destructive",
        })
        return
      }

      if (!signUpData.user) {
        setResult({ error: "Failed to create user" })
        setDebugInfo({ signUpData })
        toast({
          title: "Error",
          description: "Failed to create user",
          variant: "destructive",
        })
        return
      }

      // Try to auto-confirm email
      try {
        const confirmResponse = await fetch("/api/confirm-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: signUpData.user.id, email }),
        })

        const confirmData = await confirmResponse.json()
        setDebugInfo((prev: any) => ({ ...prev, confirmResponse: confirmData }))

        if (!confirmResponse.ok) {
          console.warn("Failed to auto-confirm email:", confirmData.error)
          // Continue anyway since we might still be able to create the profile
        }
      } catch (confirmError) {
        console.error("Error confirming email:", confirmError)
        setDebugInfo((prev: any) => ({ ...prev, confirmError }))
        // Continue anyway
      }

      // Create profile
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: signUpData.user.id,
          username: "testuser",
          full_name: "Test User",
          role: "member",
          reputation: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (profileError) {
          console.error("Profile error:", profileError)
          setDebugInfo((prev: any) => ({ ...prev, profileError }))
          // Continue anyway since the user was created
        }
      } catch (profileError) {
        console.error("Error creating profile:", profileError)
        setDebugInfo((prev: any) => ({ ...prev, profileError }))
        // Continue anyway
      }

      setResult({
        success: true,
        message: "User created successfully",
        user: { email, password },
      })
      toast({
        title: "Success",
        description: "User created successfully",
      })
    } catch (error) {
      console.error("Unexpected error:", error)
      setResult({ error: error instanceof Error ? error.message : "An unexpected error occurred" })
      setDebugInfo({ unexpectedError: error })
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      stopLoading()
    }
  }

  const handleLoginWithTestUser = async () => {
    startLoading("Logging in...")
    try {
      const supabase = createBrowserClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        setDebugInfo({ loginError: error })
        return
      }

      if (data.session) {
        // Store the session in localStorage
        localStorage.setItem("supabase-auth", JSON.stringify(data.session))

        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        // Redirect to home page
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
      setDebugInfo({ unexpectedLoginError: error })
    } finally {
      stopLoading()
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter a valid email"
              />
              <p className="text-xs text-muted-foreground">Use a valid email format (e.g., test@example.com)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
              <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
            </div>
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

          {debugInfo && <DebugInfo title="Debug Information" data={debugInfo} />}
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleCreateUser} className="w-full" type="button">
            Create Test User
          </Button>

          {result?.success && (
            <Button onClick={handleLoginWithTestUser} className="w-full" type="button">
              Login with Test User
            </Button>
          )}

          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
