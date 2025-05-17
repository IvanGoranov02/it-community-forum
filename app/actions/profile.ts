"use server"

import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateProfile(formData: FormData) {
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
    .select("id")
    .eq("username", username)
    .neq("id", user.id)
    .maybeSingle()

  if (checkError) {
    return { error: "Error checking username availability" }
  }

  if (existingUser) {
    return { error: "Username is already taken" }
  }

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
