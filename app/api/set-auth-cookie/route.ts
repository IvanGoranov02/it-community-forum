import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { session } = await request.json()

    if (!session || !session.access_token) {
      return NextResponse.json({ error: "Invalid session data" }, { status: 400 })
    }

    // Create a smaller session object for the cookie
    const cookieSession = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: {
        id: session.user?.id,
        email: session.user?.email
      }
    }

    // Create a response
    const response = NextResponse.json({ success: true })
    
    // Set the auth cookie with smaller data
    response.cookies.set({
      name: "supabase-auth",
      value: JSON.stringify(cookieSession),
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Error setting auth cookie:", error)
    return NextResponse.json({ error: "Failed to set auth cookie" }, { status: 500 })
  }
} 