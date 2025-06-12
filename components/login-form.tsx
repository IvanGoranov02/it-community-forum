"use client"

import type React from "react"
import dynamic from "next/dynamic"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase"
import { DebugInfo } from "@/components/debug-info"
import { useLoading } from "@/app/context/loading-context"
import { handleAuthError } from "@/utils/errorHandler"
import { SimpleCaptcha } from "@/components/SimpleCaptcha"
import { CheckCircle, AlertCircle } from "lucide-react"

const HCaptchaWrapper = dynamic(() => import("@/components/HCaptchaWrapper").then(mod => mod.HCaptchaWrapper), { ssr: false })

export function LoginForm({
  redirectUrl = "/",
  message,
  error: initialError,
  refreshUser,
}: {
  redirectUrl?: string
  message?: string
  error?: string
  refreshUser?: () => Promise<void>
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
  const [captchaToken, setCaptchaToken] = useState("")
  const captchaRef = useRef<any>(null)
  const searchParams = useSearchParams()
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const message = searchParams?.get("message")
    
    if (message === "registration-success") {
      setSuccessMessage("Registration successful! Please log in.")
    } else if (message === "email-confirmed") {
      setSuccessMessage("Email confirmed successfully! You can now log in.")
      toast({
        title: "Email Confirmed",
        description: "Your email has been confirmed. You can now log in to your account.",
        duration: 5000,
      })
    } else if (message === "password-reset-success") {
      setSuccessMessage("Password reset successful! Please log in with your new password.")
    }

    const error = searchParams?.get("error")
    if (error) {
      setErrorMessage(decodeURIComponent(searchParams?.get("message") || "An error occurred"))
    }
  }, [searchParams, toast])

  // Timeout fallback for loading overlay
  useEffect(() => {
    const timeout = setTimeout(() => {
      stopLoading();
      toast({
        title: "Timeout",
        description: "Something took too long. Please try again.",
        variant: "destructive",
      });
    }, 10000);
    return () => clearTimeout(timeout);
  }, [stopLoading, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startLoading("Logging in...")
    setErrorMessage("")
    setDebugInfo(null)

    if (!captchaToken) {
      setErrorMessage("Please complete the captcha verification")
      stopLoading()
      return
    }

    // Store and clear token immediately
    const tokenToUse = captchaToken
    setCaptchaToken("")

    try {
      console.log("Submitting login form with captcha token:", tokenToUse.substring(0, 10) + '...');
      
      // Use the API route instead of direct Supabase client
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        email,
        password,
          captchaToken: tokenToUse,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("Login error:", data.error, data.details);
        
        if (data.error?.includes("Email not confirmed")) {
          setErrorMessage("Please confirm your email before logging in.");
          // Optionally resend confirmation
          const supabase = createBrowserClient();
          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email,
            options: {
              emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
            },
          });

          if (!resendError) {
            toast({
              title: "Confirmation email resent",
              description: "Please check your inbox.",
            });
          }
        } else {
          setErrorMessage(data.error || "Login failed");
        }
        
        // Reset captcha for new attempt
        if (captchaRef.current) captchaRef.current.reset();
        stopLoading();
        return;
      }

      // Success
      console.log("Login successful");
      
      // Mark token as successfully used
      if (captchaRef.current) captchaRef.current.markTokenAsUsed(tokenToUse);

        toast({
          title: "Login successful",
          description: "Welcome back!",
      });
      
      // Refresh the page to ensure we have the latest session
      window.location.href = redirectUrl;

      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      console.error("Unexpected login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      // Reset captcha on unexpected error
      if (captchaRef.current) captchaRef.current.reset();
    } finally {
      stopLoading();
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

    startLoading("Sending confirmation email...")
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

  // OAuth login handler
  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    startLoading(`Login with ${provider === 'google' ? 'Google' : 'GitHub'}...`)
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
        stopLoading();
      } else if (data.url) {
        // Redirect to OAuth provider
        window.location.href = data.url
        stopLoading(); // Just in case
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error)
      setErrorMessage("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
      stopLoading();
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {successMessage && (
            <div className="bg-green-100 dark:bg-green-950 border border-green-400 dark:border-green-800 text-green-800 dark:text-green-300 px-4 py-3 rounded flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {(errorMessage || initialError) && (
            <div className="bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span>{errorMessage || initialError}</span>
              {(errorMessage || initialError)?.includes("Email not confirmed") && (
                <Button
                  variant="link"
                  className="p-0 h-auto text-black underline"
                  onClick={handleResendConfirmation}
                  type="button"
                >
                  Resend confirmation email
                </Button>
              )}
              {(initialError === "oauth-failed" || message === "account-exists") && (
                <div className="mt-2 text-sm">
                  <p className="font-medium">Account Already Exists</p>
                  <p>You already have an account with this email address. Please sign in with your email and password below.</p>
                  <p className="mt-1 text-xs text-muted-foreground">After signing in, you can link your OAuth accounts in your profile settings.</p>
                </div>
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

          {/* Add hCaptcha */}
          <div className="flex justify-center my-2" suppressHydrationWarning={true}>
            <SimpleCaptcha
              ref={captchaRef}
              sitekey="960a1f78-2ba6-4740-b518-c0ac6d368d24"
              onVerify={setCaptchaToken}
              onExpire={() => setCaptchaToken("")}
              containerId="login-captcha-container"
            />
          </div>

          {debugInfo && <DebugInfo title="Debug Information" data={debugInfo} />}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={false}>
            Login
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or continue with
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
            Don't have an account?{" "}
            <Link
              href={`/register${redirectUrl !== "/" ? `?redirect=${redirectUrl}` : ""}`}
              className="text-primary hover:underline"
            >
              Register
            </Link>
          </div>
        </CardFooter>
      </form>
      {/* Magic Link Login */}
      {/* <div className="mt-6 border-t pt-6">
        <h3 className="text-lg font-semibold mb-2">Or login with Magic Link</h3>
        <p className="text-sm text-muted-foreground mb-2">If you forgot your password, use Magic Link to log in.</p>
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
      </div> */}
    </Card>
  )
}
