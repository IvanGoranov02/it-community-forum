import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugAddIsArchivedColumnPage() {
  const supabase = createServerClient()
  let result = { success: false, message: "", error: null }

  try {
    // Проверяваме дали колоната вече съществува
    const { data: columnExists, error: checkError } = await supabase.rpc("column_exists", {
      table_name: "posts",
      column_name: "is_archived",
    })

    if (checkError) {
      // Ако функцията column_exists не съществува, създаваме я
      const createFunctionSql = `
        CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
        RETURNS boolean
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          column_exists boolean;
        BEGIN
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = $1
            AND column_name = $2
          ) INTO column_exists;
          
          RETURN column_exists;
        END;
        $$;
      `

      await supabase.rpc("execute_sql", {
        sql_query: createFunctionSql,
      })

      // Проверяваме отново
      const { data: columnExistsRetry } = await supabase.rpc("column_exists", {
        table_name: "posts",
        column_name: "is_archived",
      })

      if (columnExistsRetry) {
        result = {
          success: true,
          message: "Column is_archived already exists in posts table",
          error: null,
        }
        return result
      }
    } else if (columnExists) {
      result = {
        success: true,
        message: "Column is_archived already exists in posts table",
        error: null,
      }
      return result
    }

    // Добавяме колоната is_archived
    const sql = `
      ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
    `

    const { data, error } = await supabase.rpc("execute_sql", {
      sql_query: sql,
    })

    if (error) {
      // Ако функцията execute_sql не съществува, създаваме я
      const createExecuteSqlFunction = `
        CREATE OR REPLACE FUNCTION execute_sql(sql_query text)
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
          RETURN json_build_object('success', true);
        EXCEPTION WHEN OTHERS THEN
          RETURN json_build_object('success', false, 'error', SQLERRM);
        END;
        $$;
      `

      await supabase.from("_sql").select("*").execute(createExecuteSqlFunction)

      // Опитваме отново да добавим колоната
      const { error: retryError } = await supabase.rpc("execute_sql", {
        sql_query: sql,
      })

      if (retryError) {
        // Ако все още има грешка, опитваме директно с SQL
        const { error: directError } = await supabase.from("_sql").select("*").execute(sql)

        if (directError) {
          result = {
            success: false,
            message: "Failed to add is_archived column",
            error: directError,
          }
        } else {
          result = {
            success: true,
            message: "Successfully added is_archived column (direct SQL)",
            error: null,
          }
        }
      } else {
        result = {
          success: true,
          message: "Successfully added is_archived column (retry)",
          error: null,
        }
      }
    } else {
      result = {
        success: true,
        message: "Successfully added is_archived column",
        error: null,
      }
    }
  } catch (error) {
    result = {
      success: false,
      message: "Unexpected error",
      error,
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Add is_archived Column to Posts Table</h1>

      <div className={`p-4 rounded-lg mb-6 ${result.success ? "bg-green-100" : "bg-red-100"}`}>
        <h2 className="text-xl font-semibold mb-2">Result</h2>
        <p className={result.success ? "text-green-700" : "text-red-700"}>{result.message}</p>
        {result.error && (
          <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto max-h-96">
            {JSON.stringify(result.error, null, 2)}
          </pre>
        )}
      </div>

      <div className="flex space-x-4">
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
        <Link href="/debug-check-is-archived" className="text-blue-500 hover:underline">
          Check is_archived Column
        </Link>
        <Link href="/new-post" className="text-blue-500 hover:underline">
          Create New Post
        </Link>
      </div>
    </div>
  )
}
