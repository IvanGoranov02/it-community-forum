import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log(`Attempting login for email: ${email}`)

    const supabase = createServerClient()

    // Try to sign in with the provided credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login API error:", error)
      return NextResponse.json(
        {
          error: error.message || "Invalid email or password",
          details: error,
        },
        { status: 401 },
      )
    }

    if (!data.session) {
      console.error("No session returned after successful login")
      return NextResponse.json({ error: "Authentication succeeded but no session was created" }, { status: 500 })
    }

    console.log("Login successful, setting cookie")

    // Set the auth cookie
    const cookieStore = cookies()
    await cookieStore.set("supabase-auth", JSON.stringify(data.session), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected login API error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred during login",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
