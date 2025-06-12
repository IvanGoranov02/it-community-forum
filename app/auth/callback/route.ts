import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { generateUsername } from "@/lib/utils"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type") || ""

  if (code) {
    try {
      const supabase = createServerClient()
      const cookieStore = await cookies()

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-callback-error&message=${encodeURIComponent(error.message)}`)
      }

      if (data.session && data.user) {
        // Create a smaller session object for the cookie
        const cookieSession = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: {
            id: data.user.id,
            email: data.user.email
          }
        }

        // Set the auth cookie with smaller data
        await cookieStore.set({
          name: "supabase-auth",
          value: JSON.stringify(cookieSession),
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })

        // Check if this is a user and if they have a profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle()

        // If no profile exists, create one
        if (!existingProfile) {
          console.log("Creating profile for user:", data.user.id)
          
          // Try to get username from metadata (if set during registration)
          let username = data.user.user_metadata?.username
          
          // If no username in metadata, generate one
          if (!username) {
            username = generateUsername(data.user.email || "")
          }
          
          // Get full name from metadata
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.user_metadata?.name || 
                          data.user.email?.split("@")[0] || 
                          "User"

          // Try to create profile
          try {
            const { error: profileError } = await supabase.from("profiles").insert({
              id: data.user.id,
              username,
              full_name: fullName,
              role: "member",
              reputation: 0,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

            if (profileError) {
              console.error("Error creating profile:", profileError)
              
              if (profileError.message && profileError.message.includes("duplicate key")) {
                // Username already taken, try with a random number suffix
                const randomSuffix = Math.floor(Math.random() * 10000)
                username = `${username}${randomSuffix}`
                
                const { error: retryError } = await supabase.from("profiles").insert({
                  id: data.user.id,
                  username,
                  full_name: fullName,
                  role: "member",
                  reputation: 0,
                  avatar_url: data.user.user_metadata?.avatar_url || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                
                if (retryError) {
                  console.error("Error creating profile with random suffix:", retryError)
                }
              }
            }
          } catch (insertError) {
            console.error("Exception creating profile:", insertError)
            // Don't fail the login, just log the error
          }
        }

        // Determine redirect based on the type of callback
        if (type === "recovery") {
          // Password reset flow
          return NextResponse.redirect(`${requestUrl.origin}/reset-password?session=${encodeURIComponent(data.session.access_token)}`)
        } else if (type === "email_change") {
          // Email change flow
          return NextResponse.redirect(`${requestUrl.origin}/profile/edit?message=email-change-success`)
        } else if (type === "signup") {
          // Email confirmation after signup - Auto login the user and redirect to home
          return NextResponse.redirect(`${requestUrl.origin}/?message=email-confirmed&auto_login=true`)
        } else {
          // Default case: regular login or OAuth callback
          return NextResponse.redirect(`${requestUrl.origin}/?message=login-success`)
        }
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-callback-error`)
    }
  }

  // If there's no code or session, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
