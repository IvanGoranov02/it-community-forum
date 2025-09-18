"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { createBrowserClient } from "@/lib/supabase"

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
  const [clientUser, setClientUser] = useState<any>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    setIsClient(true)
    setHasHashFragment(!!window.location.hash)
    
    // Check client-side authentication
    const checkClientAuth = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        console.log("Client-side auth check:", { authUser: !!authUser })
        setClientUser(authUser)
      } catch (error) {
        console.error("Error checking client auth:", error)
        setClientUser(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkClientAuth()
  }, [])

  useEffect(() => {
    const effectiveUser = user || clientUser
    console.log("LoginPageClient redirect check:", {
      isClient,
      serverUser: !!user,
      clientUser: !!clientUser,
      effectiveUser: !!effectiveUser,
      hasHashFragment,
      hasRedirected,
      redirectUrl,
      isCheckingAuth
    })
    
    // Only redirect if user is logged in, there's no hash fragment, and we haven't already redirected
    if (isClient && effectiveUser && !hasHashFragment && !hasRedirected && !isCheckingAuth) {
      console.log("User already logged in, redirecting to:", redirectUrl)
      setHasRedirected(true)
      
      // Use a more reliable redirect method
      setTimeout(() => {
        window.location.href = redirectUrl
      }, 100)
    }
  }, [user, clientUser, redirectUrl, router, hasHashFragment, isClient, hasRedirected, isCheckingAuth])

  // Prevent hydration mismatch by not rendering different content on server vs client
  if (!isClient) {
    // Server-side: always render the login form to prevent hydration mismatch
    return <LoginForm redirectUrl={redirectUrl} message={message} error={error} />
  }

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
        </div>
        <p className="text-sm text-muted-foreground">
          Checking authentication...
        </p>
      </div>
    )
  }

  // If user is logged in, show a simple loading message instead of the form
  const effectiveUser = user || clientUser
  if (effectiveUser && !hasHashFragment) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
        </div>
        <p className="text-sm text-muted-foreground">
          You are already logged in. Redirecting...
        </p>
      </div>
    )
  }

  // Show loading while processing OAuth tokens
  if (effectiveUser && hasHashFragment) {
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