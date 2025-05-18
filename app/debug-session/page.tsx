import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugSessionPage() {
  try {
    const supabase = createServerClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Session</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Session</h2>
          {session ? (
            <pre className="bg-white p-4 rounded overflow-auto max-h-96">{JSON.stringify(session, null, 2)}</pre>
          ) : (
            <p className="text-red-500">
              {sessionError
                ? `Error fetching session: ${sessionError.message}`
                : "No active session found. You might need to log in."}
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/debug-user" className="text-blue-500 hover:underline">
            Check User
          </Link>
          <Link href="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugSessionPage:", error)
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
