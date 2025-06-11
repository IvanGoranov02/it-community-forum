import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getUser } from "@/app/actions/auth";

export async function GET(request: NextRequest) {
  try {
    // Проверяваме дали потребителят е администратор
    const user = await getUser();
    
    if (!user || (user.role !== "admin" && user.email !== "i.goranov02@gmail.com")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const supabase = createServerClient();
    
    // SQL заявка за добавяне на колони is_edited към таблиците posts и comments
    // Добавяне на колона is_edited към таблицата posts
    const addPostColumn = await supabase.rpc('execute_sql', {
      sql_query: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'posts'
            AND column_name = 'is_edited'
          ) THEN
            ALTER TABLE posts ADD COLUMN is_edited BOOLEAN DEFAULT false;
          END IF;
        END $$;
      `
    });
    
    // Добавяне на колона is_edited към таблицата comments
    const addCommentColumn = await supabase.rpc('execute_sql', {
      sql_query: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'comments'
            AND column_name = 'is_edited'
          ) THEN
            ALTER TABLE comments ADD COLUMN is_edited BOOLEAN DEFAULT false;
          END IF;
        END $$;
      `
    });
    
    // Проверка за грешки
    if (addPostColumn.error) {
      console.error("Error adding is_edited to posts:", addPostColumn.error);
      return NextResponse.json(
        { error: "Failed to add is_edited to posts", details: addPostColumn.error },
        { status: 500 }
      );
    }
    
    if (addCommentColumn.error) {
      console.error("Error adding is_edited to comments:", addCommentColumn.error);
      return NextResponse.json(
        { error: "Failed to add is_edited to comments", details: addCommentColumn.error },
        { status: 500 }
      );
    }
    
    // Извеждане на кеша на схемата (важно за избягване на грешки с липсващи колони)
    const refreshCache = await supabase.rpc('refresh_schema_cache');
    
    return NextResponse.json({
      success: true,
      message: "Columns added successfully",
      post_result: addPostColumn,
      comment_result: addCommentColumn,
      cache_refresh: refreshCache
    });
  } catch (error) {
    console.error("Error in database update:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 