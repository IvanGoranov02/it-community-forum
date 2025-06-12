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
import { useLoading } from "@/app/context/loading-context"
import { HCaptchaWrapper } from "@/components/HCaptchaWrapper"

export function RegisterForm({ redirectUrl = "/" }: { redirectUrl?: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const { startLoading, stopLoading } = useLoading()
  const [errorMessage, setErrorMessage] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [captchaToken, setCaptchaToken] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startLoading("Registering...")
    setErrorMessage("")
    setDebugInfo(null)

    if (!email || !name || !password) {
      setErrorMessage("All fields are required")
      stopLoading()
      return
    }

    if (!captchaToken) {
      setErrorMessage("Please complete the captcha verification")
      stopLoading()
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
        stopLoading()
        return
      }

      if (existingUser) {
        setErrorMessage("Username is already taken. Please choose another one.")
        stopLoading()
        return
      }

      // Get the site URL from environment variable or use the current origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      // Create the user with the correct redirect URL and captcha token
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${siteUrl}/auth/callback`,
          captchaToken,
        },
      })

      if (authError) {
        console.error("Auth error during registration:", authError)
        setErrorMessage(authError.message || "Failed to create user")
        setDebugInfo({ authError })
        stopLoading()
        return
      }

      if (!authData.user) {
        setErrorMessage("Failed to create user")
        stopLoading()
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
        stopLoading()
        return
      }

      // Show success message
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      })

      // Redirect to login page and stop loading
      router.push("/login?message=registration-success")
      stopLoading()
    } catch (error) {
      console.error("Unexpected error during registration:", error)
      setErrorMessage("An unexpected error occurred during registration")
      setDebugInfo({ unexpectedError: error })
      stopLoading()
    }
  }

  // OAuth login handler
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    startLoading(`Register with ${provider === 'google' ? 'Google' : 'GitHub'}...`)
    setErrorMessage("")

    try {
      const supabase = createBrowserClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (error) {
        console.error(`${provider} OAuth error:`, error)
        setErrorMessage(error.message)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else if (data.url) {
        // Redirect to OAuth provider
        window.location.href = data.url
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      setErrorMessage("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      stopLoading()
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

          <div className="flex justify-center my-2">
            <HCaptchaWrapper
              sitekey="960a1f78-2ba6-4740-b518-c0ac6d368d24"
              onVerify={setCaptchaToken}
              onExpire={() => setCaptchaToken("")}
            />
          </div>

          {debugInfo && <DebugInfo title="Debug Information" data={debugInfo} />}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full">
            Register
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or register with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="w-full"
            >
              <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
          </div>

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
