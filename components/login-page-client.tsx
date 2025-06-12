"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/app/context/auth-context"
import { useLoading } from "@/app/context/loading-context"

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
  const { startLoading, stopLoading } = useLoading()

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
          stopLoading() // Make sure to stop loading if it was started
          router.push("/")
        }, 500) // Reduced delay
      })
    } else {
      // Refresh user state when component mounts (normal flow)
      refreshUser()
    }
  }, [refreshUser, router, searchParams, stopLoading])

  useEffect(() => {
    // Only redirect if user is logged in and there's no hash fragment (OAuth tokens)
    // and we're not in the email confirmation flow
    if (isClient && user && !hasHashFragment && !isConfirmingEmail) {
      console.log("User already logged in, redirecting to:", redirectUrl)
      router.push(redirectUrl)
    }
  }, [user, redirectUrl, router, hasHashFragment, isClient, isConfirmingEmail])

  // We don't need to show our own loading spinners anymore since we use the global loading overlay
  // This simplifies the component and provides a consistent UX

  return <LoginForm redirectUrl={redirectUrl} message={message} error={error} refreshUser={refreshUser} />
} 