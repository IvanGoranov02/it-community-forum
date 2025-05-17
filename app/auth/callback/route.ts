import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    try {
      const supabase = createServerClient()
      const cookieStore = cookies()

      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-callback-error`)
      }

      if (data.session) {
        // Set the auth cookie
        cookieStore.set({
          name: "supabase-auth",
          value: JSON.stringify(data.session),
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        })

        return NextResponse.redirect(`${requestUrl.origin}/login?message=email-confirmed`)
      }
    } catch (error) {
      console.error("Unexpected error in auth callback:", error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth-callback-error`)
    }
  }

  // If there's no code or session, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
