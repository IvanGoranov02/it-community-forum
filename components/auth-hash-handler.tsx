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
          const type = params.get("type")
          
          // Check if this is an auth response
          if (accessToken && (type === "signup" || type === "recovery")) {
            // Get Supabase client
            const supabase = createBrowserClient()
            
            // Set the session manually if we have both tokens
            if (refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              })
            
              // Store the session in localStorage for client-side auth
              const session = {
                access_token: accessToken,
                refresh_token: refreshToken,
                // Set a reasonable expiry (3600 seconds = 1 hour)
                expires_at: Math.floor(Date.now() / 1000) + 3600
              }
              localStorage.setItem("supabase-auth", JSON.stringify(session))
              
              // Also set the cookie via API for server-side auth
              try {
                await fetch("/api/set-auth-cookie", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ session })
                })
              } catch (error) {
                console.warn("Failed to set server-side cookie, but client auth should still work", error)
              }
            }
            
            // Show a success message based on the auth type
            if (type === "signup") {
              toast({
                title: "Email confirmed",
                description: "Your email has been confirmed and you are now logged in.",
              })
              
              // Redirect to home page after signup confirmation
              window.location.href = "/"
            } else if (type === "recovery") {
              toast({
                title: "Authentication successful",
                description: "You can now reset your password.",
              })
              
              // For recovery links, construct the proper URL with all parameters
              const url = `/reset-password?access_token=${encodeURIComponent(accessToken)}${refreshToken ? `&refresh_token=${encodeURIComponent(refreshToken)}` : ''}&type=recovery`
              
              // Use window.location for a full page reload to ensure parameters are properly handled
              window.location.href = url
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
        
        // Clear the hash fragment from the URL to prevent re-processing
        if (window.history.replaceState) {
          // Replace the current URL without the hash
          window.history.replaceState(null, "", window.location.pathname + window.location.search)
        } else {
          // Fallback for older browsers
          window.location.hash = ""
        }
      }
      
      handleHashParams()
    }
  }, [router, toast])

  // This component doesn't render anything
  return null
} 