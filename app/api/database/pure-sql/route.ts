import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    console.log("Pure SQL approach: Adding is_edited columns to tables...");
    
    const supabase = createServerClient();
    let success = true;
    
    // Най-прост подход: изпълняваме директно SQL заявки без никакви функции
    
    // Подход 1: Най-директен
    console.log("Approach 1: Direct ALTER TABLE statements...");
    
    try {
      const { data: rawSqlResult, error: rawSqlError } = await supabase.rpc('execute_sql', {
        sql_query: `
          BEGIN;
          
          -- Add is_edited to posts if it doesn't exist
          DO $$ 
          BEGIN 
            IF NOT EXISTS(
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='posts' AND column_name='is_edited'
            ) THEN
              ALTER TABLE posts ADD COLUMN is_edited BOOLEAN DEFAULT false;
            END IF;
          END $$;
          
          -- Add is_edited to comments if it doesn't exist
          DO $$ 
          BEGIN 
            IF NOT EXISTS(
              SELECT 1 FROM information_schema.columns 
              WHERE table_name='comments' AND column_name='is_edited'
            ) THEN
              ALTER TABLE comments ADD COLUMN is_edited BOOLEAN DEFAULT false;
            END IF;
          END $$;
          
          COMMIT;
        `
      });
      
      if (rawSqlError) {
        console.error("Error executing raw SQL:", rawSqlError);
        success = false;
      } else {
        console.log("Successfully executed raw SQL");
      }
    } catch (rawSqlError) {
      console.error("Exception executing raw SQL:", rawSqlError);
      success = false;
    }
    
    // Подход 2: Още по-прост, един по един
    if (!success) {
      console.log("Approach 2: Simpler ALTER TABLE statements one by one...");
      
      try {
        // Добавяме is_edited към posts
        const { error: postsError } = await supabase.rpc('execute_sql', {
          sql_query: `ALTER TABLE IF EXISTS posts ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;`
        });
        
        if (postsError) {
          console.error("Error adding is_edited to posts (simple):", postsError);
        } else {
          console.log("Successfully executed simple ALTER TABLE for posts");
          success = true;
        }
        
        // Добавяме is_edited към comments
        const { error: commentsError } = await supabase.rpc('execute_sql', {
          sql_query: `ALTER TABLE IF EXISTS comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;`
        });
        
        if (commentsError) {
          console.error("Error adding is_edited to comments (simple):", commentsError);
          success = false;
        } else {
          console.log("Successfully executed simple ALTER TABLE for comments");
        }
      } catch (simpleError) {
        console.error("Exception with simple approach:", simpleError);
        success = false;
      }
    }
    
    // Обновяваме кеша на схемата, независимо от резултата
    console.log("Refreshing schema cache...");
    try {
      await supabase.rpc('refresh_schema_cache');
      console.log("Schema cache refresh requested");
      
      // Допълнително извикване за обновяване на кеша
      await supabase.rpc('execute_sql', {
        sql_query: `NOTIFY pgrst, 'reload schema';`
      });
      console.log("Schema reload notification sent");
    } catch (refreshError) {
      console.error("Error refreshing schema:", refreshError);
    }
    
    return NextResponse.json({
      success: success,
      message: success 
        ? "Pure SQL approach: Columns added successfully. Please restart your application." 
        : "Pure SQL approach: There were errors adding columns. Check server logs.",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Unexpected error in pure SQL approach:", error);
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