import { createServerClient } from "@/lib/supabase"
import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, provider, accessToken, refreshToken } = await request.json()
    
    if (!email || !provider || !accessToken || !refreshToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient()

    // Try to set the OAuth session directly
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })

    if (sessionError) {
      console.error('Failed to set OAuth session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to link OAuth account' },
        { status: 400 }
      )
    }

    if (sessionData.session) {
      // Check if profile exists for this user
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', sessionData.session.user.id)
        .maybeSingle()

      // If no profile exists, create one
      if (!profile) {
        const generateUsername = (email: string) => {
          const baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "")
          return baseUsername + Math.floor(Math.random() * 1000)
        }

        const username = generateUsername(sessionData.session.user.email || "")
        const fullName = sessionData.session.user.user_metadata?.full_name || 
                        sessionData.session.user.user_metadata?.name || 
                        sessionData.session.user.email?.split("@")[0] || 
                        "User"

        await supabase.from("profiles").insert({
          id: sessionData.session.user.id,
          username,
          full_name: fullName,
          avatar_url: sessionData.session.user.user_metadata?.avatar_url || 
                     sessionData.session.user.user_metadata?.picture || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }

      return NextResponse.json({
        success: true,
        message: 'OAuth account linked successfully',
        session: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          expires_at: sessionData.session.expires_at,
          user: {
            id: sessionData.session.user.id,
            email: sessionData.session.user.email
          }
        }
      })
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 400 }
    )

  } catch (error) {
    console.error('OAuth linking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 