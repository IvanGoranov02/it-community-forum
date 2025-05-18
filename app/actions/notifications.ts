"use server"

import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import type { NotificationType } from "@/types/notifications"

export async function createNotification(
  userId: string,
  content: string,
  link: string,
  type: NotificationType = "system",
) {
  try {
    const supabase = createServerClient()

    // Проверяваме дали потребителят съществува
    const { data: userCheck, error: userError } = await supabase.from("profiles").select("id").eq("id", userId).single()

    if (userError || !userCheck) {
      console.error("Error checking user for notification:", userError)
      return { error: "Потребителят не съществува" }
    }

    // Ако линкът е към пост, проверяваме дали постът съществува
    if (link.includes("/post/")) {
      const match = link.match(/\/post\/([^#]+)/)
      if (match && match[1]) {
        const slug = match[1]

        const { data: postCheck, error: postError } = await supabase
          .from("posts")
          .select("id")
          .eq("slug", slug)
          .single()

        if (postError || !postCheck) {
          console.error("Error checking post for notification:", postError)
          return { error: "Постът не съществува" }
        }
      }
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        content,
        link,
        type,
        is_read: false,
      })
      .select()

    if (error) {
      console.error("Error creating notification:", error)
      return { error: error.message }
    }

    return { success: true, notification: data[0] }
  } catch (error: any) {
    console.error("Unexpected error creating notification:", error)
    return { error: error.message || "Неочаквана грешка при създаването на известие" }
  }
}

export async function getUserNotifications(limit = 10) {
  const user = await getUser()

  if (!user) {
    return []
  }

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }

  return data
}

export async function getUnreadNotificationsCount() {
  const user = await getUser()

  if (!user) {
    return 0
  }

  const supabase = createServerClient()

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    console.error("Error fetching unread notifications count:", error)
    return 0
  }

  return count || 0
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createServerClient()
  const user = await getUser()

  if (!user) {
    return { error: "Трябва да сте влезли в профила си, за да маркирате известията като прочетени" }
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error marking notification as read:", error)
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = createServerClient()
  const user = await getUser()

  if (!user) {
    return { error: "Трябва да сте влезли в профила си, за да маркирате известията като прочетени" }
  }

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)

  if (error) {
    console.error("Error marking all notifications as read:", error)
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { success: true }
}
