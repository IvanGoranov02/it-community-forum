import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("Direct SQL approach: Adding is_edited columns to tables...");
    
    const supabase = createServerClient();
    let success = true;
    
    // Директно изпълняваме SQL заявки, без да използваме функции
    
    // Първо, добавяме колоната is_edited към posts
    console.log("Adding is_edited column to posts table...");
    try {
      const { error: postsError } = await supabase
        .from('_postgrest_schema_migrations')
        .insert({
          name: 'add_is_edited_to_posts',
          query: `
            DO $$
            BEGIN
              ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
            EXCEPTION WHEN duplicate_column THEN
              NULL;
            END $$;
          `
        });
      
      if (postsError) {
        console.error("Error adding is_edited to posts:", postsError);
        success = false;
      } else {
        console.log("Successfully added is_edited to posts table or it already exists");
      }
    } catch (postsError) {
      console.error("Exception adding is_edited to posts:", postsError);
      success = false;
    }
    
    // След това, добавяме колоната is_edited към comments
    console.log("Adding is_edited column to comments table...");
    try {
      const { error: commentsError } = await supabase
        .from('_postgrest_schema_migrations')
        .insert({
          name: 'add_is_edited_to_comments',
          query: `
            DO $$
            BEGIN
              ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
            EXCEPTION WHEN duplicate_column THEN
              NULL;
            END $$;
          `
        });
      
      if (commentsError) {
        console.error("Error adding is_edited to comments:", commentsError);
        success = false;
      } else {
        console.log("Successfully added is_edited to comments table or it already exists");
      }
    } catch (commentsError) {
      console.error("Exception adding is_edited to comments:", commentsError);
      success = false;
    }
    
    // Накрая, извикваме мануален SQL refresh
    console.log("Manual schema refresh...");
    try {
      const { error: refreshError } = await supabase
        .from('_postgrest_schema_migrations')
        .insert({
          name: 'refresh_schema_cache',
          query: `
            DO $$
            BEGIN
              NOTIFY pgrst, 'reload schema';
            END $$;
          `
        });
      
      if (refreshError) {
        console.error("Error refreshing schema:", refreshError);
      } else {
        console.log("Successfully sent schema refresh notification");
      }
    } catch (refreshError) {
      console.error("Exception refreshing schema:", refreshError);
    }
    
    return NextResponse.json({
      success: success,
      message: success 
        ? "Direct SQL approach: Columns added successfully. Please restart your application." 
        : "Direct SQL approach: There were errors adding columns. Check server logs.",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Unexpected error in direct SQL approach:", error);
    return NextResponse.json(
      { 
        error: "An unexpected error occurred", 
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 