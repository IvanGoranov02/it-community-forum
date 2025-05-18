import { getUser } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SimpleEditPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/simple-edit")
  }

  const supabase = createServerClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  async function updateProfile(formData: FormData) {
    "use server"

    const username = formData.get("username") as string
    const fullName = formData.get("fullName") as string
    const bio = formData.get("bio") as string

    if (!username) {
      return { error: "Username is required" }
    }

    const supabase = createServerClient()

    // Check if username is already taken (by another user)
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .maybeSingle()

    if (existingUser) {
      return { error: "Username is already taken" }
    }

    // Update profile
    await supabase
      .from("profiles")
      .update({
        username,
        full_name: fullName,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    redirect(`/profile/${username}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Profile (Simple)</h1>

      <form action={updateProfile} className="space-y-6 max-w-md">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <Input id="username" name="username" defaultValue={profile?.username || ""} required />
        </div>

        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium">
            Full Name
          </label>
          <Input id="fullName" name="fullName" defaultValue={profile?.full_name || ""} required />
        </div>

        <div className="space-y-2">
          <label htmlFor="bio" className="block text-sm font-medium">
            Bio
          </label>
          <Textarea id="bio" name="bio" defaultValue={profile?.bio || ""} rows={4} />
        </div>

        <div className="flex justify-between">
          <Link href={`/profile/${profile?.username}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  )
}
