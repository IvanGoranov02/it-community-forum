"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function getUserSettings() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

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
}

export async function updateUserSettings(settings: {
  emailNotifications: boolean
  marketingEmails: boolean
  activitySummary: boolean
  theme: string
  language: string
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

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
}
