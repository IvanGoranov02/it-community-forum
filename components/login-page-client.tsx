"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"

interface LoginPageClientProps {
  user: any
  redirectUrl: string
  message?: string
  error?: string
}

export function LoginPageClient({ user, redirectUrl, message, error }: LoginPageClientProps) {
  console.log("LoginPageClient props:", { user: !!user, redirectUrl, message, error })
  
  const router = useRouter()
  const [hasHashFragment, setHasHashFragment] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setHasHashFragment(!!window.location.hash)
  }, [])

  useEffect(() => {
    console.log("LoginPageClient redirect check:", {
      isClient,
      user: !!user,
      hasHashFragment,
      hasRedirected,
      redirectUrl
    })
    
    // Only redirect if user is logged in, there's no hash fragment, and we haven't already redirected
    if (isClient && user && !hasHashFragment && !hasRedirected) {
      console.log("User already logged in, redirecting to:", redirectUrl)
      setHasRedirected(true)
      router.push(redirectUrl)
    }
  }, [user, redirectUrl, router, hasHashFragment, isClient, hasRedirected])

  // Prevent hydration mismatch by not rendering different content on server vs client
  if (!isClient) {
    // Server-side: always render the login form to prevent hydration mismatch
    return <LoginForm redirectUrl={redirectUrl} message={message} error={error} />
  }

  // Show loading while processing OAuth tokens
  if (user && hasHashFragment) {
    console.log("User logged in but processing OAuth tokens...")
    return (
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
        </div>
        <p className="text-sm text-muted-foreground">
          Completing your login...
        </p>
      </div>
    )
  }

  return <LoginForm redirectUrl={redirectUrl} message={message} error={error} />
} 