"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Проверяваме дали таблицата user_settings съществува и я създаваме, ако не съществува
async function ensureUserSettingsTableExists() {
  const supabase = createServerClient()

  // Проверяваме дали таблицата съществува
  const { error: checkError } = await supabase.from("user_settings").select("count").limit(1)

  if (checkError && checkError.code === "42P01") {
    // Код за несъществуваща таблица
    // Създаваме таблицата
    await supabase.rpc("create_user_settings_table")
  }
}

export async function getUserSettings() {
  try {
    const supabase = createServerClient()

    // Уверяваме се, че таблицата съществува
    await ensureUserSettingsTableExists()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return null
    }

    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", session.user.id).single()

    if (error || !data) {
      console.log("No settings found or error:", error)
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

    // Уверяваме се, че таблицата съществува
    await ensureUserSettingsTableExists()

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
      console.error("Error saving settings:", result.error)
      throw new Error("Грешка при запазване на настройките: " + result.error.message)
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error updating user settings:", error)
    return { error: error instanceof Error ? error.message : "Грешка при запазване на настройките" }
  }
}
