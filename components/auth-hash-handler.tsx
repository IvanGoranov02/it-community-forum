"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export function AuthHashHandler() {
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return

    // Check if there's a hash fragment in the URL
    if (window.location.hash) {
      const handleHashParams = async () => {
        try {
          // Remove the # character
          const hash = window.location.hash.substring(1)
          
          // Parse the hash fragment as query parameters
          const params = new URLSearchParams(hash)
          
          // Extract the relevant parameters
          const accessToken = params.get("access_token")
          const refreshToken = params.get("refresh_token")
          const expiresAt = params.get("expires_at")
          const tokenType = params.get("token_type")
          
          // Check if this is an OAuth response
          if (accessToken && refreshToken && tokenType === "bearer") {
            // Get Supabase client
            const supabase = createBrowserClient()
            
            // Set the session manually
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            })
            
            if (error) {
              console.error("Error setting session:", error)
              toast({
                title: "Authentication error",
                description: "There was a problem processing your authentication. Please try again.",
                variant: "destructive"
              })
              return
            }

            if (data.session) {
              // Store the session in localStorage for client-side auth
              localStorage.setItem("supabase-auth", JSON.stringify(data.session))
              
              // Also set the cookie via API for server-side auth
              try {
                await fetch("/api/set-auth-cookie", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ session: data.session })
                })
              } catch (error) {
                console.warn("Failed to set server-side cookie, but client auth should still work", error)
              }

              // Show success message
              toast({
                title: "Login successful",
                description: "Welcome! You have successfully logged in with OAuth.",
              })
              
              // Clear the hash fragment from the URL
              if (window.history.replaceState) {
                window.history.replaceState(null, "", window.location.pathname + window.location.search)
              }
              
              // Redirect to home page with success message
              router.push("/?message=oauth-success")
              router.refresh()
            }
          }
        } catch (error) {
          console.error("Error processing auth hash:", error)
          toast({
            title: "Authentication error",
            description: "There was a problem processing your authentication. Please try again.",
            variant: "destructive"
          })
        }
      }
      
      handleHashParams()
    }
  }, [router, toast])

  // This component doesn't render anything
  return null
} 