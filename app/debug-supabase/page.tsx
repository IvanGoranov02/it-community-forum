import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugSupabasePage() {
  try {
    const supabase = createServerClient()

    // Test a simple query to check if Supabase is working
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").limit(5)

    // Check if profiles table exists
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").limit(5)

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Supabase</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Supabase Connection</h2>
          {!categoriesError ? (
            <p className="text-green-500">✅ Supabase connection is working</p>
          ) : (
            <p className="text-red-500">❌ Supabase connection error: {categoriesError.message}</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Categories Table</h2>
          {categories && categories.length > 0 ? (
            <pre className="bg-white p-4 rounded overflow-auto max-h-96">{JSON.stringify(categories, null, 2)}</pre>
          ) : (
            <p className="text-red-500">
              {categoriesError ? `Error fetching categories: ${categoriesError.message}` : "No categories found"}
            </p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Profiles Table</h2>
          {profiles && profiles.length > 0 ? (
            <pre className="bg-white p-4 rounded overflow-auto max-h-96">{JSON.stringify(profiles, null, 2)}</pre>
          ) : (
            <p className="text-red-500">
              {profilesError ? `Error fetching profiles: ${profilesError.message}` : "No profiles found"}
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-session" className="text-blue-500 hover:underline">
            Check Session
          </Link>
          <Link href="/debug-user" className="text-blue-500 hover:underline">
            Check User
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugSupabasePage:", error)
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Error</h1>
        <p className="text-red-500">An unexpected error occurred</p>
        <pre className="bg-gray-100 p-4 rounded mt-4 overflow-auto max-h-96">
          {error instanceof Error ? error.message : "Unknown error"}
        </pre>
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    )
  }
}
