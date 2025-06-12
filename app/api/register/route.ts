import { createServerClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { generateUsername } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const { email, password, name, username: providedUsername, captchaToken } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (!captchaToken) {
      return NextResponse.json({ error: "Captcha token is required" }, { status: 400 })
    }

    console.log(`Attempting registration for email: ${email}`)

    const supabase = createServerClient()

    // Generate username from email if not provided
    const username = providedUsername || generateUsername(email)

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking username availability:", checkError)
      return NextResponse.json({ error: "Error checking username availability" }, { status: 500 })
    }

    if (existingUser) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
    }

    // Get the site URL from environment variable or use a fallback
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.headers.get("origin") || "http://localhost:3000"

    // Create the user with the correct redirect URL and captcha token
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${siteUrl}/auth/callback`,
        captchaToken,
      },
    })

    if (authError) {
      console.error("Auth error during registration:", authError)
      return NextResponse.json(
        {
          error: authError.message || "Failed to create user",
          details: authError,
        },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Wait a moment to ensure the user is fully created in the auth system
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create the profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
      full_name: name,
      role: "member",
      reputation: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile error during registration:", profileError)
      return NextResponse.json(
        {
          error: profileError.message,
          details: profileError,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected registration API error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred during registration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
} 