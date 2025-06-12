"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export function AuthHashHandler() {
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasProcessed, setHasProcessed] = useState(false)

  // Function to handle automatic account linking when OAuth fails due to existing email
  const handleAccountLinking = async (params: URLSearchParams) => {
    console.log("Attempting to provide better user guidance for account linking...")
    
    // Instead of trying to automatically link (which requires manual linking to be enabled),
    // we'll provide better user guidance
    toast({
      title: "Account Already Exists",
      description: "You already have an account with this email. Please sign in with your email and password first, then you can link your OAuth accounts in your profile settings.",
      variant: "destructive"
    })
    
    // Clear the hash fragment and redirect to login with a helpful message
    if (window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search)
    }
    
    setIsProcessing(false)
    router.push("/login?message=account-exists")
    
    throw new Error("User needs to sign in with existing account first")
  }

  useEffect(() => {
    // Only run in browser and if not already processed
    if (typeof window === "undefined" || hasProcessed) return

    console.log("AuthHashHandler: Checking for hash fragment")
    console.log("Current URL:", window.location.href)
    console.log("Hash fragment:", window.location.hash)

    // Check if there's a hash fragment in the URL
    if (window.location.hash) {
      setHasProcessed(true) // Mark as processed to prevent re-runs
      setIsProcessing(true)
      
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
            let shouldTryAutoLink = false
            
            if (error === "server_error" && errorDescription?.includes("Multiple accounts")) {
              // This means there's an existing account with the same email
              // We can try to handle this automatically by linking the accounts
              shouldTryAutoLink = true
              userFriendlyMessage = "Linking your OAuth account to existing account..."
            } else if (errorDescription) {
              userFriendlyMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '))
            }
            
            if (shouldTryAutoLink) {
              // Show a different message for auto-linking attempt
              toast({
                title: "Account Linking",
                description: userFriendlyMessage,
              })
              
              // Try to handle the account linking automatically
              try {
                await handleAccountLinking(params)
                return
              } catch (linkError) {
                console.error("Auto-linking failed:", linkError)
                // Fall back to showing error message
                userFriendlyMessage = "You already have an account with this email address. Please log in with your email and password first, then you can link your OAuth accounts in your profile settings."
              }
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
            
            setIsProcessing(false)
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
              setIsProcessing(false)
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
                window.location.href = "/"
              }, 1000) // Small delay to ensure everything is processed
            }
          } else {
            console.log("AuthHashHandler: No valid OAuth tokens found in hash")
            setIsProcessing(false)
          }
        } catch (error) {
          console.error("Error processing auth hash:", error)
          toast({
            title: "Authentication error",
            description: "There was a problem processing your authentication. Please try again.",
            variant: "destructive"
          })
          setIsProcessing(false)
        }
      }
      
      handleHashParams()
    } else {
      console.log("AuthHashHandler: No hash fragment found")
    }
  }, [router, toast, hasProcessed])

  // Show loading spinner while processing OAuth tokens
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card p-8 rounded-lg shadow-lg border flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <h3 className="text-lg font-semibold">Processing login...</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please wait while we complete your OAuth authentication
            </p>
          </div>
        </div>
      </div>
    )
  }

  // This component doesn't render anything when not processing
  return null
} 