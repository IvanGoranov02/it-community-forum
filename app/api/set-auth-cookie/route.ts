import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { session } = await request.json()

    if (!session || !session.access_token) {
      return NextResponse.json({ error: "Invalid session data" }, { status: 400 })
    }

    // Create a response
    const response = NextResponse.json({ success: true })
    
    // Set the auth cookie directly on the response
    response.cookies.set({
      name: "supabase-auth",
      value: JSON.stringify(session),
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