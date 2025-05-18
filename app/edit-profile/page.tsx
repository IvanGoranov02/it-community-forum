import { ProfileEditForm } from "@/components/profile-edit-form"
import { getUser } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export default async function EditProfilePage() {
  try {
    const user = await getUser()

    if (!user) {
      console.log("No user found, redirecting to login")
      redirect("/login?redirect=/edit-profile")
    }

    console.log("User found:", user.id, user.username)

    // Get full profile data
    const supabase = createServerClient()
    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Error fetching profile:", error)
      return (
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
          <p className="text-red-500">Failed to load profile: {error.message}</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      )
    }

    if (!profile) {
      console.error("No profile found for user:", user.id)
      return (
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Error</h1>
          <p className="text-red-500">Profile not found</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      )
    }

    console.log("Profile found:", profile.id, profile.username)

    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            href={`/profile/${user.username}`}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Profile
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
          <p className="text-muted-foreground mt-1">Update your profile information</p>
        </div>

        <ProfileEditForm
          user={{
            id: user.id,
            username: user.username,
            name: user.name,
            bio: profile?.bio || undefined,
            avatar: profile?.avatar_url || undefined,
          }}
        />
      </div>
    )
  } catch (error) {
    console.error("Unexpected error in EditProfilePage:", error)
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight">Error</h1>
        <p className="text-red-500">An unexpected error occurred</p>
        <Link href="/" className="text-blue-500 hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    )
  }
}
