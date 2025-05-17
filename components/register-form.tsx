"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase"
import { DebugInfo } from "@/components/debug-info"

export function RegisterForm({ redirectUrl = "/" }: { redirectUrl?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")
    setDebugInfo(null)

    if (!email || !name || !password) {
      setErrorMessage("All fields are required")
      setIsLoading(false)
      return
    }

    // Generate username from email if not provided
    const finalUsername =
      username || email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") + Math.floor(Math.random() * 1000)

    try {
      const supabase = createBrowserClient()

      // Check if username is already taken
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", finalUsername)
        .maybeSingle()

      if (checkError) {
        setErrorMessage("Error checking username availability")
        setDebugInfo({ checkError })
        setIsLoading(false)
        return
      }

      if (existingUser) {
        setErrorMessage("Username is already taken. Please choose another one.")
        setIsLoading(false)
        return
      }

      // Create the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (authError) {
        console.error("Auth error during registration:", authError)
        setErrorMessage(authError.message || "Failed to create user")
        setDebugInfo({ authError })
        setIsLoading(false)
        return
      }

      if (!authData.user) {
        setErrorMessage("Failed to create user")
        setIsLoading(false)
        return
      }

      // Create the profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        username: finalUsername,
        full_name: name,
        role: "member",
        reputation: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (profileError) {
        console.error("Profile error during registration:", profileError)
        setErrorMessage(profileError.message)
        setDebugInfo({ profileError })
        setIsLoading(false)
        return
      }

      // Show success message
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      })

      // Redirect to login page
      router.push("/login?message=registration-success")
    } catch (error) {
      console.error("Unexpected error during registration:", error)
      setErrorMessage("An unexpected error occurred during registration")
      setDebugInfo({ unexpectedError: error })
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Join the IT community forum</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-black px-4 py-3 rounded">{errorMessage}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username (optional)</Label>
            <Input
              id="username"
              name="username"
              placeholder="johndoe123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If not provided, a username will be generated from your email
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
          </div>

          {debugInfo && <DebugInfo title="Debug Information" data={debugInfo} />}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Register"}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href={`/login${redirectUrl !== "/" ? `?redirect=${redirectUrl}` : ""}`}
              className="text-primary hover:underline"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
