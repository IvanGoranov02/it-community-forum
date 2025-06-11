import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    
    // Check if table exists first
    const { data: tables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'content_reports');
    
    if (checkError) {
      console.error("Error checking if table exists:", checkError);
    }
    
    if (tables && tables.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "content_reports table already exists" 
      });
    }
    
    // Since we can't execute raw SQL easily, let's create a simple test
    // The user will need to create the table manually in Supabase Dashboard
    return NextResponse.json({ 
      success: false, 
      message: "Please create the content_reports table manually in Supabase Dashboard",
      sql: `
        CREATE TABLE content_reports (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment')),
          content_id UUID NOT NULL,
          reporter_id UUID NOT NULL REFERENCES profiles(id),
          reason TEXT NOT NULL,
          details TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        CREATE INDEX content_reports_content_idx ON content_reports(content_type, content_id);
        CREATE INDEX content_reports_reporter_idx ON content_reports(reporter_id);
        CREATE INDEX content_reports_status_idx ON content_reports(status);
      `
    });
    
  } catch (error) {
    console.error("Error in setup-admin-tables:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 