"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Типове за настройките
export type UserSettings = {
  theme: string
  language: string
  email_notifications: boolean
  marketing_emails: boolean
  activity_summary: boolean
}

// Типове за отговора
export type SettingsResponse = {
  success?: boolean
  error?: string
  data?: UserSettings
}

// Функция за извличане на настройките на потребителя
export async function getUserSettings(): Promise<UserSettings | null> {
  try {
    const supabase = createServerClient()

    // Извличаме сесията
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Ако няма сесия, връщаме null
    if (!session) {
      console.log("No session found when getting settings")
      return null
    }

    // Извличаме настройките от базата данни
    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", session.user.id).single()

    // Ако има грешка или няма данни, връщаме настройки по подразбиране
    if (error || !data) {
      console.log("No settings found or error:", error)
      return {
        theme: "system",
        language: "bg",
        email_notifications: true,
        marketing_emails: false,
        activity_summary: true,
      }
    }

    // Връщаме настройките
    return data
  } catch (error) {
    console.error("Error getting user settings:", error)
    return null
  }
}

// Функция за обновяване на настройките на потребителя
export async function updateUserSettings(formData: FormData): Promise<SettingsResponse> {
  try {
    const supabase = createServerClient()

    // Извличаме сесията
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Ако няма сесия, връщаме грешка
    if (!session) {
      console.log("No session found when updating settings")
      return { error: "Не сте влезли в системата. Моля, влезте отново." }
    }

    // Извличаме данните от формата
    const theme = formData.get("theme") as string
    const language = formData.get("language") as string
    const email_notifications = formData.get("email_notifications") === "on"
    const marketing_emails = formData.get("marketing_emails") === "on"
    const activity_summary = formData.get("activity_summary") === "on"

    // Създаваме обект с настройките
    const settings = {
      theme,
      language,
      email_notifications,
      marketing_emails,
      activity_summary,
    }

    console.log("Updating settings:", settings)

    // Проверяваме дали потребителят има настройки
    const { data: existingSettings } = await supabase
      .from("user_settings")
      .select("id")
      .eq("user_id", session.user.id)
      .single()

    let result

    // Ако има настройки, ги обновяваме, иначе създаваме нови
    if (existingSettings) {
      result = await supabase.from("user_settings").update(settings).eq("user_id", session.user.id)
    } else {
      result = await supabase.from("user_settings").insert({
        user_id: session.user.id,
        ...settings,
      })
    }

    // Ако има грешка, връщаме я
    if (result.error) {
      console.error("Error saving settings:", result.error)
      return { error: "Грешка при запазване на настройките: " + result.error.message }
    }

    // Обновяваме страницата
    revalidatePath("/settings")

    // Връщаме успех
    return { success: true, data: settings }
  } catch (error) {
    console.error("Error updating user settings:", error)
    return { error: error instanceof Error ? error.message : "Грешка при запазване на настройките" }
  }
}
