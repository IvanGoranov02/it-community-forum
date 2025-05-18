import { createServerClient } from "@/lib/supabase"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DebugProfilesDataPage() {
  try {
    const supabase = createServerClient()

    // Get profiles with pagination
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)

    // Count posts by user
    const profilesWithPostCounts = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { count, error: countError } = await supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .eq("author_id", profile.id)

        return {
          ...profile,
          post_count: count || 0,
          count_error: countError?.message,
        }
      }),
    )

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Profiles Data</h1>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Profiles</h2>

          {profilesError ? (
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-700">Error: {profilesError.message}</p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded shadow overflow-x-auto">
              <h3 className="font-medium text-lg mb-4">Profiles Data (Latest 20)</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Username</th>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Posts</th>
                    <th className="px-4 py-2 text-left">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {profilesWithPostCounts.map((profile, i) => (
                    <tr key={profile.id} className={i % 2 === 0 ? "bg-gray-50" : ""}>
                      <td className="px-4 py-2">{profile.id}</td>
                      <td className="px-4 py-2">
                        <Link href={`/profile/${profile.username}`} className="text-blue-500 hover:underline">
                          {profile.username}
                        </Link>
                      </td>
                      <td className="px-4 py-2">{profile.name}</td>
                      <td className="px-4 py-2">{profile.email}</td>
                      <td className="px-4 py-2">{profile.post_count}</td>
                      <td className="px-4 py-2">{new Date(profile.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Back to Home
          </Link>
          <Link href="/debug-database-schema" className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            View Database Schema
          </Link>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Debug Profiles Data</h1>
        <div className="bg-red-100 p-4 rounded">
          <p className="text-red-700">Error: {error instanceof Error ? error.message : String(error)}</p>
        </div>
        <div className="mt-4">
          <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }
}
