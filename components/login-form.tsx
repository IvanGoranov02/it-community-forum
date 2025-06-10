"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase"
import { DebugInfo } from "@/components/debug-info"
import { useLoading } from "@/app/context/loading-context"

export function LoginForm({
  redirectUrl = "/",
  message,
  error: initialError,
}: {
  redirectUrl?: string
  message?: string
  error?: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { startLoading, stopLoading } = useLoading()
  const [errorMessage, setErrorMessage] = useState(initialError || "")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [magicEmail, setMagicEmail] = useState("")
  const [magicLoading, setMagicLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startLoading("Влизане в системата...")
    setErrorMessage("")
    setDebugInfo(null)

    try {
      const supabase = createBrowserClient()

      // Try client-side login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("Login error:", authError)

        // Special handling for unconfirmed emails
        if (authError.message.includes("Email not confirmed")) {
          setErrorMessage("Please confirm your email before logging in. Check your inbox for a confirmation link.")

          // Get the site URL from environment variable or use the current origin
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

          // Offer to resend confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email,
            options: {
              emailRedirectTo: `${siteUrl}/auth/callback`,
            },
          })

          if (!resendError) {
            toast({
              title: "Confirmation email resent",
              description: "Please check your inbox for the confirmation link.",
            })
          }
        } else {
          setErrorMessage(authError.message)
        }

        setDebugInfo({ clientError: authError })
        stopLoading()
        return
      }

      if (authData.session) {
        // Store the session in localStorage
        localStorage.setItem("supabase-auth", JSON.stringify(authData.session))

        // Also try to set the cookie via API for server-side auth
        try {
          const response = await fetch("/api/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!response.ok) {
            console.warn("Server-side login failed, but client auth succeeded:", data)
            // We can continue since client-side auth worked
          }
        } catch (e) {
          // Ignore errors here, we already have client-side auth
          console.warn("Failed to set server-side cookie, but client auth succeeded", e)
        }

        toast({
          title: "Login successful",
          description: "Welcome back!",
        })

        // Redirect to the specified URL
        router.push(redirectUrl)
        router.refresh()
      }
    } catch (error) {
      console.error("Login error:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
      setDebugInfo({ unexpectedError: error })
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      stopLoading()
    }
  }

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to resend the confirmation.",
        variant: "destructive",
      })
      return
    }

    startLoading("Изпращане на имейл за потвърждение...")
    try {
      const supabase = createBrowserClient()

      // Get the site URL from environment variable or use the current origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin

      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback`,
        },
      })

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Confirmation email sent",
          description: "Please check your inbox for the confirmation link.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend confirmation email.",
        variant: "destructive",
      })
    } finally {
      stopLoading()
    }
  }

  // Magic Link login handler
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setMagicLoading(true)
    setErrorMessage("")
    try {
      const supabase = createBrowserClient()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
      const { error } = await supabase.auth.signInWithOtp({
        email: magicEmail,
        options: {
          emailRedirectTo: `${siteUrl}/login?magic=1`,
        },
      })
      if (error) {
        setErrorMessage(error.message)
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Check your email", description: "We've sent you a magic link to log in." })
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.")
      toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" })
    } finally {
      setMagicLoading(false)
    }
  }

  // Redirect to /change-password after magic link login
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search)
      if (params.get("magic") === "1") {
        router.replace("/change-password")
      }
    }
  }, [router])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {message && (
            <div className="bg-green-100 border border-green-400 text-black px-4 py-3 rounded">
              <p>{message}</p>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-black px-4 py-3 rounded">
              <p>{errorMessage}</p>
              {errorMessage.includes("Email not confirmed") && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-black underline"
                  onClick={handleResendConfirmation}
                  type="button"
                >
                  Resend confirmation email
                </Button>
              )}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
            <div className="flex justify-end">
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/forgot-password">Forgot password?</Link>
              </Button>
            </div>
          </div>

          {debugInfo && <DebugInfo title="Debug Information" data={debugInfo} />}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={false}>
            Login
          </Button>
        </CardFooter>
      </form>
      {/* Magic Link Login */}
      <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">Or login with Magic Link</h3>
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="magicEmail">Email</Label>
            <Input
              id="magicEmail"
              name="magicEmail"
              type="email"
              required
              value={magicEmail}
              onChange={e => setMagicEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={magicLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={magicLoading}>
            {magicLoading ? "Sending..." : "Send Magic Link"}
          </Button>
        </form>
      </div>
    </Card>
  )
}
