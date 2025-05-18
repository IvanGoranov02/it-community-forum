"use server"

import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"

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
  try {
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
      console.error("Error checking username availability:", checkError)
      return { error: "Error checking username availability" }
    }

    if (existingUser) {
      return { error: "Username is already taken" }
    }

    // Get current user profile to check for avatar changes
    const { data: currentProfile, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching current profile:", profileError)
      return { error: "Error fetching current profile" }
    }

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
      console.error("Error updating profile:", updateError)
      return { error: updateError.message || "Failed to update profile" }
    }

    revalidatePath(`/profile/${username}`)
    revalidatePath("/")

    // Return success instead of redirecting
    return { success: true, username }
  } catch (error) {
    console.error("Unexpected error in updateProfile:", error)
    return { error: "An unexpected error occurred while updating your profile" }
  }
}

/**
 * Извлича информация за профил по ID
 * @param profileId ID на профила
 * @returns Информация за профила или грешка
 */
export async function getProfileById(profileId: string) {
  try {
    const supabase = createServerClient();
    // Извличаме профила
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        role,
        reputation,
        created_at,
        updated_at
      `)
      .eq("id", profileId)
      .maybeSingle();
    if (error) {
      console.error("Error fetching profile by ID:", error);
      return { success: false, error: error.message };
    }
    if (!profile) {
      return { success: false, error: "Profile not found" };
    }
    // Извличаме броя на постовете на потребителя
    const { count: postCount, error: postError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("author_id", profileId);
    if (postError) {
      console.error("Error counting posts for profile:", postError);
    }
    // Извличаме броя на коментарите на потребителя
    const { count: commentCount, error: commentError } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("author_id", profileId);
    if (commentError) {
      console.error("Error counting comments for profile:", commentError);
    }
    return {
      success: true,
      profile: {
        ...profile,
        postCount: postCount || 0,
        commentCount: commentCount || 0
      }
    };
  } catch (error) {
    console.error("Unexpected error fetching profile by ID:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Извлича информация за профил по потребителско име
 * @param username Потребителско име
 * @returns Информация за профила или грешка
 */
export async function getProfileByUsername(username: string) {
  try {
    const supabase = createServerClient();
    // Извличаме профила
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        full_name,
        avatar_url,
        bio,
        role,
        reputation,
        created_at,
        updated_at
      `)
      .eq("username", username)
      .maybeSingle();
    if (error) {
      console.error("Error fetching profile by username:", error);
      return { success: false, error: error.message };
    }
    if (!profile) {
      return { success: false, error: "Profile not found" };
    }
    // Извличаме броя на постовете на потребителя
    const { count: postCount, error: postError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("author_id", profile.id);
    if (postError) {
      console.error("Error counting posts for profile:", postError);
    }
    // Извличаме броя на коментарите на потребителя
    const { count: commentCount, error: commentError } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("author_id", profile.id);
    if (commentError) {
      console.error("Error counting comments for profile:", commentError);
    }
    return {
      success: true,
      profile: {
        ...profile,
        postCount: postCount || 0,
        commentCount: commentCount || 0
      }
    };
  } catch (error) {
    console.error("Unexpected error fetching profile by username:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
