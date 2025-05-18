"use server"

import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// Helper function to extract file path from avatar URL
function extractAvatarPath(url: string): string | null {
  if (!url) return null

  const urlParts = url.split("/avatars/")
  if (urlParts.length > 1) {
    return urlParts[1].split("?")[0] // Remove any query parameters
  }
  return null
}

export async function updateProfile(prevState: any, formData: FormData) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to update your profile" }
  }

  const username = formData.get("username") as string
  const fullName = formData.get("fullName") as string
  const bio = formData.get("bio") as string
  const avatarUrl = formData.get("avatarUrl") as string

  if (!username) {
    return { error: "Username is required" }
  }

  const supabase = createServerClient()

  // Check if username is already taken (by another user)
  const { data: existingUser, error: checkError } = await supabase
    .from("profiles")
    .select("id, avatar_url")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle()

  if (checkError) {
    return { error: "Error checking username availability" }
  }

  if (existingUser) {
    return { error: "Username is already taken" }
  }

  // Get current user profile to check for avatar changes
  const { data: currentProfile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

  // If avatar URL has changed and the old one exists, we could delete it here
  // But this is already handled in the client component for better UX

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      username,
      full_name: fullName,
      bio,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    return { error: updateError.message || "Failed to update profile" }
  }

  revalidatePath(`/profile/${username}`)
  revalidatePath("/")

  redirect(`/profile/${username}`)
}
