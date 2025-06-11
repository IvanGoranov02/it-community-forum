import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("Attempting to add is_edited columns to tables...");
    
    const supabase = createServerClient();
    
    // Първо, добавяме колоната is_edited към posts
    console.log("Adding is_edited column to posts table...");
    let success = true;
    
    try {
      const { error: postsError } = await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE IF EXISTS posts 
          ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
        `
      });
      
      if (postsError) {
        console.error("Error adding is_edited to posts:", postsError);
        success = false;
      } else {
        console.log("Successfully added is_edited to posts table");
      }
    } catch (postsError) {
      console.error("Exception adding is_edited to posts:", postsError);
      success = false;
    }
    
    // След това, добавяме колоната is_edited към comments
    console.log("Adding is_edited column to comments table...");
    try {
      const { error: commentsError } = await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE IF EXISTS comments 
          ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
        `
      });
      
      if (commentsError) {
        console.error("Error adding is_edited to comments:", commentsError);
        success = false;
      } else {
        console.log("Successfully added is_edited to comments table");
      }
    } catch (commentsError) {
      console.error("Exception adding is_edited to comments:", commentsError);
      success = false;
    }
    
    // Накрая, опитваме се да обновим кеша на схемата
    console.log("Refreshing schema cache...");
    try {
      const { error: cacheError } = await supabase.rpc('refresh_schema_cache');
      
      if (cacheError) {
        console.error("Error refreshing schema cache:", cacheError);
      } else {
        console.log("Successfully refreshed schema cache");
      }
    } catch (cacheError) {
      console.error("Exception refreshing schema cache:", cacheError);
    }
    
    return NextResponse.json({
      success: success,
      message: success 
        ? "Columns added successfully. Please restart your application." 
        : "There were errors adding columns. Check server logs.",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Unexpected error:", error);
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