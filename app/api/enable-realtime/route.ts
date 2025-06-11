import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Проверяваме дали notifications таблицата има активиран realtime
    const { data: tableData, error: tableError } = await supabase.rpc(
      "get_publication_tables",
      { publication_name: "supabase_realtime" }
    )
    
    if (tableError) {
      console.error("Error checking publication tables:", tableError)
      return NextResponse.json({ error: tableError.message }, { status: 500 })
    }
    
    const notificationsEnabled = tableData?.some(
      (table: any) => table.table === "notifications" && table.schema === "public"
    )
    
    if (!notificationsEnabled) {
      // Активираме realtime за notifications таблицата
      const { error: enableError } = await supabase.rpc(
        "supabase_functions.http_request",
        {
          method: "POST",
          url: `${process.env.SUPABASE_URL}/rest/v1/realtime/changes`,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            type: "postgres_changes",
            event: "*",
            schema: "public",
            table: "notifications"
          })
        }
      )
      
      if (enableError) {
        console.error("Error enabling realtime:", enableError)
        return NextResponse.json({ error: enableError.message }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Realtime enabled for notifications table"
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Realtime already enabled for notifications table",
      tables: tableData
    })
  } catch (error: any) {
    console.error("Error enabling realtime:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()
    
    // Проверяваме дали notifications таблицата има активиран realtime
    const { data: tableData, error: tableError } = await supabase.rpc(
      "get_publication_tables",
      { publication_name: "supabase_realtime" }
    )
    
    if (tableError) {
      console.error("Error checking publication tables:", tableError)
      return NextResponse.json({ error: tableError.message }, { status: 500 })
    }
    
    const notificationsEnabled = tableData?.some(
      (table: any) => table.table === "notifications" && table.schema === "public"
    )
    
    if (!notificationsEnabled) {
      // Активираме realtime за notifications таблицата
      const { error: enableError } = await supabase.rpc(
        "supabase_functions.http_request",
        {
          method: "POST",
          url: `${process.env.SUPABASE_URL}/rest/v1/realtime/changes`,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({
            type: "postgres_changes",
            event: "*",
            schema: "public",
            table: "notifications"
          })
        }
      )
      
      if (enableError) {
        console.error("Error enabling realtime:", enableError)
        return NextResponse.json({ error: enableError.message }, { status: 500 })
      }
      
      return NextResponse.json({ 
        success: true, 
        message: "Realtime enabled for notifications table"
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Realtime already enabled for notifications table",
      tables: tableData
    })
  } catch (error: any) {
    console.error("Error enabling realtime:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 