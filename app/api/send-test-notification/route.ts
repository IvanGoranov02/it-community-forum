import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "userId parameter is required" }, { status: 400 })
    }

    console.log("Request to send notification to user ID:", userId)
    console.log("Using Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Service Role Key available:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    const supabaseUrl = "https://ufxyqcpxjpnebsyiunam.supabase.co"
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmeHlxY3B4anBuZWJzeWl1bmFtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzUxNzU4NSwiZXhwIjoyMDYzMDkzNTg1fQ.faVPLApKGZbXfLrqMM9s2wHwjgW68x8syMCnuB2PZjA"

    // Използваме Service Role Key за администраторски достъп
    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Директно вмъкваме нотификация с админски права без да проверяваме потребителя
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        content: "Тестова нотификация " + new Date().toLocaleTimeString(),
        link: "/test-notification",
        type: "system",
        is_read: false,
      })
      .select()

    if (error) {
      console.error("Error creating notification:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("Test notification sent successfully:", data)
    return NextResponse.json({ success: true, notification: data[0] })
  } catch (error: any) {
    console.error("Error sending test notification:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 