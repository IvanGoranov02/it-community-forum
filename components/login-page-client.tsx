"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/app/context/auth-context"
import { Loader2 } from "lucide-react"

interface LoginPageClientProps {
  user: any
  redirectUrl: string
  message?: string
  error?: string
}

export function LoginPageClient({ user: initialUser, redirectUrl, message, error }: LoginPageClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hasHashFragment, setHasHashFragment] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false)
  const { user, refreshUser } = useAuth()

  useEffect(() => {
    setIsClient(true)
    setHasHashFragment(!!window.location.hash)
    
    // Check if we're in the email confirmation flow
    const msg = searchParams?.get("message")
    const autoLogin = searchParams?.get("auto_login")
    if (msg === "email-confirmed" && autoLogin === "true") {
      setIsConfirmingEmail(true)
      
      // Refresh user state and redirect after a short delay
      refreshUser().then(() => {
        setTimeout(() => {
          router.push("/")
        }, 1000)
      })
    } else {
      // Refresh user state when component mounts (normal flow)
      refreshUser()
    }
  }, [refreshUser, router, searchParams])

  useEffect(() => {
    // Only redirect if user is logged in and there's no hash fragment (OAuth tokens)
    // and we're not in the email confirmation flow
    if (isClient && user && !hasHashFragment && !isConfirmingEmail) {
      console.log("User already logged in, redirecting to:", redirectUrl)
      router.push(redirectUrl)
    }
  }, [user, redirectUrl, router, hasHashFragment, isClient, isConfirmingEmail])

  // Show loading while processing email confirmation
  if (isConfirmingEmail) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <h2 className="text-xl font-medium">Email Confirmed!</h2>
          <p className="text-muted-foreground">
            Your email has been confirmed and you are now being logged in...
          </p>
        </div>
      </div>
    )
  }

  // Show loading while processing OAuth tokens
  if (isClient && user && hasHashFragment) {
    console.log("User logged in but processing OAuth tokens...")
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <h2 className="text-xl font-medium">Completing login...</h2>
          <p className="text-muted-foreground">
            Please wait while we complete your authentication.
          </p>
        </div>
      </div>
    )
  }

  return <LoginForm redirectUrl={redirectUrl} message={message} error={error} refreshUser={refreshUser} />
} 