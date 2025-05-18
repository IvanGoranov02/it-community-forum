import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Създаваме таблицата user_settings, ако не съществува
    const result = await supabase.rpc("create_settings_table")

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error creating settings table:", error)
    return NextResponse.json({ error: "Failed to create settings table" }, { status: 500 })
  }
}
