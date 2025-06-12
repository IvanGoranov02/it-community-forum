import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password, provider } = await request.json()

    if (!email || !password || !provider) {
      return NextResponse.json({ error: "Email, password, and provider are required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // First, verify the user's email/password credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Now try to link the OAuth provider
    const { data: linkData, error: linkError } = await supabase.auth.linkIdentity({
      provider: provider as any,
    })

    if (linkError) {
      console.error("Error linking OAuth provider:", linkError)
      return NextResponse.json({ error: linkError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${provider} account linked successfully`,
      linkUrl: linkData.url 
    })

  } catch (error) {
    console.error("Unexpected error linking OAuth:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 