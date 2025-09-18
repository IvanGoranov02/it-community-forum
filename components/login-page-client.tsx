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
        setClientUser(authUser)
      } catch (error) {
        setClientUser(null)
      } finally {
        setIsCheckingAuth(false)
      }
    }
    
    checkClientAuth()
  }, [])

  useEffect(() => {
    const effectiveUser = user || clientUser
    
    // Only redirect if user is logged in, there's no hash fragment, and we haven't already redirected
    if (isClient && effectiveUser && !hasHashFragment && !hasRedirected && !isCheckingAuth) {
      setHasRedirected(true)
      
      // Use immediate redirect
      window.location.href = redirectUrl
    }
  }, [user, clientUser, redirectUrl, router, hasHashFragment, isClient, hasRedirected, isCheckingAuth])

  // Prevent hydration mismatch by not rendering different content on server vs client
  if (!isClient) {
    // Server-side: always render the login form to prevent hydration mismatch
    return <LoginForm redirectUrl={redirectUrl} message={message} error={error} />
  }

  // If user is logged in, redirect immediately without showing anything
  const effectiveUser = user || clientUser
  if (effectiveUser && !hasHashFragment && !isCheckingAuth) {
    return null // Don't show anything, just redirect
  }

  // Show minimal loading only while checking auth
  if (isCheckingAuth) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  // Show loading while processing OAuth tokens
  if (effectiveUser && hasHashFragment) {
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