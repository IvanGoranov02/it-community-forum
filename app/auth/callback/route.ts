import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { generateUsername } from "@/lib/utils"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const supabase = createServerClient()
      const cookieStore = await cookies()

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-callback-error`)
      }

      if (data.session && data.user) {
        // Set the auth cookie
        await cookieStore.set({
          name: "supabase-auth",
          value: JSON.stringify(data.session),
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })

        // Check if this is an OAuth user and if they have a profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", data.user.id)
          .maybeSingle()

        // If no profile exists, create one for OAuth users
        if (!existingProfile) {
          const username = generateUsername(data.user.email || "")
          const fullName = data.user.user_metadata?.full_name || 
                          data.user.user_metadata?.name || 
                          data.user.email?.split("@")[0] || 
                          "User"

          const { error: profileError } = await supabase.from("profiles").insert({
            id: data.user.id,
            username,
            full_name: fullName,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Error creating profile for OAuth user:", profileError)
            // Don't fail the login, just log the error
          }
        }

        // Redirect to home page for successful OAuth login
        return NextResponse.redirect(`${requestUrl.origin}/?message=oauth-success`)
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-callback-error`)
    }
  }

  // If there's no code or session, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
