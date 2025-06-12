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

    console.log("AuthHashHandler: Checking for hash fragment")
    console.log("Current URL:", window.location.href)
    console.log("Hash fragment:", window.location.hash)

    // Check if there's a hash fragment in the URL
    if (window.location.hash) {
      const handleHashParams = async () => {
        try {
          console.log("AuthHashHandler: Processing hash fragment")
          
          // Remove the # character
          const hash = window.location.hash.substring(1)
          console.log("Hash content:", hash)
          
          // Parse the hash fragment as query parameters
          const params = new URLSearchParams(hash)
          console.log("Parsed params:", Object.fromEntries(params.entries()))
          
          // Check for OAuth errors first
          const error = params.get("error")
          const errorCode = params.get("error_code")
          const errorDescription = params.get("error_description")
          
          if (error) {
            console.error("OAuth error:", { error, errorCode, errorDescription })
            
            let userFriendlyMessage = "There was a problem with OAuth login."
            
            if (error === "server_error" && errorDescription?.includes("Multiple accounts")) {
              userFriendlyMessage = "You already have an account with this email address. Please log in with your email and password instead, or contact support to link your Google account."
            } else if (errorDescription) {
              userFriendlyMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            }
            
            toast({
              title: "OAuth Login Error",
              description: userFriendlyMessage,
              variant: "destructive"
            })
            
            // Clear the hash fragment and redirect to login
            if (window.history.replaceState) {
              window.history.replaceState(null, "", window.location.pathname + window.location.search)
            }
            
            router.push("/login?error=oauth-failed")
            return
          }
          
          // Extract the OAuth success parameters
          const accessToken = params.get("access_token")
          const refreshToken = params.get("refresh_token")
          const expiresAt = params.get("expires_at")
          const tokenType = params.get("token_type")
          
          console.log("OAuth tokens found:", {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            tokenType,
            expiresAt
          })
          
          // Check if this is an OAuth response
          if (accessToken && refreshToken && tokenType === "bearer") {
            console.log("AuthHashHandler: Valid OAuth tokens found, setting session")
            
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

            console.log("Session set successfully:", data.session?.user?.email)

            if (data.session) {
              // Check if this is an OAuth user and if they have a profile
              try {
                const { data: existingProfile } = await supabase
                  .from("profiles")
                  .select("id")
                  .eq("id", data.session.user.id)
                  .maybeSingle()

                // If no profile exists, create one for OAuth users
                if (!existingProfile) {
                  console.log("Creating profile for OAuth user...")
                  
                  // Generate username from email
                  const generateUsername = (email: string) => {
                    const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
                    return baseUsername + Math.floor(Math.random() * 1000)
                  }

                  const username = generateUsername(data.session.user.email || "")
                  const fullName = data.session.user.user_metadata?.full_name || 
                                  data.session.user.user_metadata?.name || 
                                  data.session.user.email?.split("@")[0] || 
                                  "User"

                  const { error: profileError } = await supabase.from("profiles").insert({
                    id: data.session.user.id,
                    username,
                    full_name: fullName,
                    avatar_url: data.session.user.user_metadata?.avatar_url || 
                               data.session.user.user_metadata?.picture || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  })

                  if (profileError) {
                    console.error("Error creating profile for OAuth user:", profileError)
                    // Don't fail the login, just log the error
                  } else {
                    console.log("Profile created successfully for OAuth user")
                  }
                }
              } catch (error) {
                console.error("Error checking/creating profile:", error)
                // Don't fail the login, just log the error
              }

              // Create a smaller session object for storage
              const storageSession = {
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
                expires_at: data.session.expires_at,
                user: {
                  id: data.session.user?.id,
                  email: data.session.user?.email
                }
              }

              // Store the session in localStorage for client-side auth
              localStorage.setItem("supabase-auth", JSON.stringify(storageSession))
              console.log("Session stored in localStorage")
              
              // Also set the cookie via API for server-side auth
              try {
                console.log("Setting server-side cookie...")
                await fetch("/api/set-auth-cookie", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ session: data.session })
                })
                console.log("Server-side cookie set successfully")
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
              
              console.log("Redirecting to home page...")
              // Use window.location.href for more reliable redirection
              setTimeout(() => {
                window.location.href = "/?message=oauth-success"
              }, 1000) // Small delay to ensure everything is processed
            }
          } else {
            console.log("AuthHashHandler: No valid OAuth tokens found in hash")
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
    } else {
      console.log("AuthHashHandler: No hash fragment found")
    }
  }, [router, toast])

  // This component doesn't render anything
  return null
} 