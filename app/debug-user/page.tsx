import { getUser } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugUserPage() {
  try {
    const user = await getUser()
    const supabase = createServerClient()

    let profile = null
    let profileError = null

    if (user) {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      profile = data
      profileError = error
    }

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug User Information</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">User</h2>
          {user ? (
            <pre className="bg-white p-4 rounded overflow-auto max-h-96">{JSON.stringify(user, null, 2)}</pre>
          ) : (
            <p className="text-red-500">No user found. You might need to log in.</p>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Profile</h2>
          {profile ? (
            <pre className="bg-white p-4 rounded overflow-auto max-h-96">{JSON.stringify(profile, null, 2)}</pre>
          ) : (
            <p className="text-red-500">
              {profileError
                ? `Error fetching profile: ${profileError.message}`
                : "No profile found or user not logged in"}
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
          <Link href="/user-edit" className="text-blue-500 hover:underline">
            Go to Edit Profile
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in DebugUserPage:", error)
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
