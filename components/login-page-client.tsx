"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/app/context/auth-context"

interface LoginPageClientProps {
  user: any
  redirectUrl: string
  message?: string
  error?: string
}

export function LoginPageClient({ user: initialUser, redirectUrl, message, error }: LoginPageClientProps) {
  const router = useRouter()
  const [hasHashFragment, setHasHashFragment] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const { user, refreshUser } = useAuth()

  useEffect(() => {
    setIsClient(true)
    setHasHashFragment(!!window.location.hash)
    
    // Refresh user state when component mounts
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    // Only redirect if user is logged in and there's no hash fragment (OAuth tokens)
    if (isClient && user && !hasHashFragment) {
      console.log("User already logged in, redirecting to:", redirectUrl)
      router.push(redirectUrl)
    }
  }, [user, redirectUrl, router, hasHashFragment, isClient])

  // Show loading while processing OAuth tokens
  if (isClient && user && hasHashFragment) {
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

  return <LoginForm redirectUrl={redirectUrl} message={message} error={error} refreshUser={refreshUser} />
} 