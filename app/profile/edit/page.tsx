import { ProfileEditForm } from "@/components/profile-edit-form"
import { OAuthAccountsManager } from "@/components/oauth-accounts-manager"
import { getUser } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export default async function EditProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/profile/edit")
  }

  // Get full profile data
  const supabase = createServerClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

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

      <div className="space-y-8">
      <ProfileEditForm
        user={{
          id: user.id,
          username: user.username,
          name: user.name,
          bio: profile?.bio || undefined,
          avatar: profile?.avatar_url || undefined,
        }}
      />
        
        <OAuthAccountsManager />
      </div>
    </div>
  )
}
