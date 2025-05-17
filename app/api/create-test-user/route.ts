import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Try to sign in with the test credentials to check if the user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "test@example.com",
      password: "password123",
    })

    // If sign in succeeds, the user already exists
    if (signInData?.user) {
      // Try to confirm email if it's not already confirmed
      try {
        await supabase.auth.admin.updateUserById(signInData.user.id, { email_confirmed: true })
      } catch (confirmError) {
        console.warn("Failed to confirm existing user's email:", confirmError)
        // Continue anyway since user exists
      }

      return NextResponse.json({
        message: "Test user already exists",
        user: { email: "test@example.com", password: "password123" },
      })
    }

    // Create a new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "test@example.com",
      password: "password123",
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    })

    if (authError) {
      console.error("Error creating auth user:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Auto-confirm the email since this is a test user
    try {
      await supabase.auth.admin.updateUserById(authData.user.id, { email_confirmed: true })
    } catch (confirmError) {
      console.error("Failed to auto-confirm email:", confirmError)
      // Continue anyway since user was created
    }

    // Create the profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username: "testuser",
      full_name: "Test User",
      role: "member",
      reputation: 0,
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Test user created successfully",
      user: { email: "test@example.com", password: "password123" },
    })
  } catch (error) {
    console.error("Unexpected error creating test user:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
