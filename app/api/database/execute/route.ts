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
    
    // Директно добавяме колоните чрез SQL заявки
    
    // Проверяваме дали колоната is_edited съществува в таблицата posts
    const { data: postsColumnExists, error: postsColumnCheckError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'posts')
      .eq('column_name', 'is_edited')
      .maybeSingle();
    
    if (postsColumnCheckError) {
      console.error("Error checking posts column:", postsColumnCheckError);
    }
    
    // Ако колоната не съществува, добавяме я
    if (!postsColumnExists) {
      const { error: addPostColumnError } = await supabase.rpc('create_column_if_not_exists', {
        table_name: 'posts',
        column_name: 'is_edited',
        column_type: 'boolean',
        default_value: 'false'
      });
      
      if (addPostColumnError) {
        console.error("Error adding is_edited to posts:", addPostColumnError);
      }
    }
    
    // Проверяваме дали колоната is_edited съществува в таблицата comments
    const { data: commentsColumnExists, error: commentsColumnCheckError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'comments')
      .eq('column_name', 'is_edited')
      .maybeSingle();
    
    if (commentsColumnCheckError) {
      console.error("Error checking comments column:", commentsColumnCheckError);
    }
    
    // Ако колоната не съществува, добавяме я
    if (!commentsColumnExists) {
      const { error: addCommentColumnError } = await supabase.rpc('create_column_if_not_exists', {
        table_name: 'comments',
        column_name: 'is_edited',
        column_type: 'boolean',
        default_value: 'false'
      });
      
      if (addCommentColumnError) {
        console.error("Error adding is_edited to comments:", addCommentColumnError);
      }
    }
    
    // Обновяваме кеша на схемата, за да включим новите колони
    const { data: refreshCacheData, error: refreshCacheError } = await supabase.rpc('refresh_schema_cache');
    
    if (refreshCacheError) {
      console.error("Error refreshing schema cache:", refreshCacheError);
    }
    
    return NextResponse.json({
      success: true,
      message: "Columns added or already exist",
      posts_column_exists: !!postsColumnExists,
      comments_column_exists: !!commentsColumnExists,
      cache_refreshed: !refreshCacheError
    });
  } catch (error) {
    console.error("Error in database execute endpoint:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 