"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function getUserSettings() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", session.user.id).single()

    if (error || !data) {
      // Return default settings if no settings found
      return {
        emailNotifications: true,
        marketingEmails: false,
        activitySummary: true,
        theme: "system",
        language: "bg",
      }
    }

    return data
  } catch (error) {
    console.error("Error getting user settings:", error)
    return {
      emailNotifications: true,
      marketingEmails: false,
      activitySummary: true,
      theme: "system",
      language: "bg",
    }
  }
}

export async function updateUserSettings(settings: {
  emailNotifications: boolean
  marketingEmails: boolean
  activitySummary: boolean
  theme: string
  language: string
}) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new Error("Не сте влезли в системата")
    }

    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", session.user.id)
      .single()

    let result

    if (existingSettings) {
      // Update existing settings
      result = await supabase.from("user_settings").update(settings).eq("user_id", session.user.id)
    } else {
      // Create new settings
      result = await supabase.from("user_settings").insert({
        user_id: session.user.id,
        ...settings,
      })
    }

    if (result.error) {
      throw new Error("Грешка при запазване на настройките")
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating user settings:", error)
    return { error: error instanceof Error ? error.message : "Грешка при запазване на настройките" }
  }
}
