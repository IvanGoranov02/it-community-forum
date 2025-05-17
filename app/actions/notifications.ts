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
  const supabase = createServerClient()

  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    content,
    link,
    type,
    is_read: false,
  })

  if (error) {
    console.error("Error creating notification:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function markNotificationAsRead(notificationId: string) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to manage notifications" }
  }

  const supabase = createServerClient()

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
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to manage notifications" }
  }

  const supabase = createServerClient()

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    console.error("Error marking all notifications as read:", error)
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { success: true }
}

export async function deleteNotification(notificationId: string) {
  const user = await getUser()

  if (!user) {
    return { error: "You must be logged in to manage notifications" }
  }

  const supabase = createServerClient()

  const { error } = await supabase.from("notifications").delete().eq("id", notificationId).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting notification:", error)
    return { error: error.message }
  }

  revalidatePath("/notifications")
  return { success: true }
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
    console.error("Error counting unread notifications:", error)
    return 0
  }

  return count || 0
}

export async function getUserNotifications(limit = 20) {
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
