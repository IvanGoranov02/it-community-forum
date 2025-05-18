"use server"

import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { UserRole, AdminStats, UserManagementFilters, AdminSettings } from "@/types/admin"

// Помощна функция за проверка на администраторски права
async function checkAdminAccess() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/admin")
  }

  const supabase = createServerClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  return user
}

// Помощна функция за проверка на модераторски права
async function checkModeratorAccess() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/admin")
  }

  const supabase = createServerClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    redirect("/")
  }

  return user
}

// Получаване на административна статистика
export async function getAdminStats(): Promise<AdminStats> {
  await checkAdminAccess()

  const supabase = createServerClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISOString = today.toISOString()

  // Общ брой потребители
  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  // Общ брой постове
  const { count: totalPosts } = await supabase.from("posts").select("*", { count: "exact", head: true })

  // Общ брой коментари
  const { count: totalComments } = await supabase.from("comments").select("*", { count: "exact", head: true })

  // Нови потребители днес
  const { count: newUsersToday } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayISOString)

  // Нови постове днес
  const { count: newPostsToday } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayISOString)

  // Нови коментари днес
  const { count: newCommentsToday } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayISOString)

  // Активни потребители (с активност през последните 7 дни)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoISOString = sevenDaysAgo.toISOString()

  const { count: activeUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .or(`updated_at.gte.${sevenDaysAgoISOString}`)

  return {
    totalUsers: totalUsers || 0,
    totalPosts: totalPosts || 0,
    totalComments: totalComments || 0,
    newUsersToday: newUsersToday || 0,
    newPostsToday: newPostsToday || 0,
    newCommentsToday: newCommentsToday || 0,
    activeUsers: activeUsers || 0,
  }
}

// Получаване на списък с потребители с филтри
export async function getUsers(filters: UserManagementFilters = {}) {
  await checkAdminAccess()

  const supabase = createServerClient()
  let query = supabase.from("profiles").select("*")

  // Прилагане на филтри
  if (filters.role) {
    query = query.eq("role", filters.role)
  }

  if (filters.search) {
    query = query.or(`username.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
  }

  // Сортиране
  const sortBy = filters.sortBy || "created_at"
  const sortOrder = filters.sortOrder || "desc"
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching users:", error)
    return []
  }

  return data
}

// Промяна на ролята на потребител
export async function updateUserRole(userId: string, role: UserRole) {
  await checkAdminAccess()

  const supabase = createServerClient()

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId)

  if (error) {
    console.error("Error updating user role:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

// Блокиране/разблокиране на потребител
export async function toggleUserBan(userId: string, isBanned: boolean) {
  await checkAdminAccess()

  const supabase = createServerClient()

  // Първо проверяваме дали потребителят е администратор
  const { data: userProfile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (userProfile?.role === "admin") {
    return { error: "Не можете да блокирате администратор" }
  }

  // Обновяваме потребителския профил
  const { error } = await supabase
    .from("profiles")
    .update({
      is_banned: isBanned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Error toggling user ban:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/users")
  return { success: true }
}

// Получаване на докладвано съдържание
export async function getReportedContent(status: "pending" | "all" = "pending") {
  await checkModeratorAccess()

  const supabase = createServerClient()

  let query = supabase
    .from("content_reports")
    .select(`
      *,
      reporter:profiles!reporter_id(username, avatar_url)
    `)
    .order("created_at", { ascending: false })

  if (status !== "all") {
    query = query.eq("status", status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching reported content:", error)
    return []
  }

  // Зареждане на съдържанието за всеки доклад
  const reportsWithContent = await Promise.all(
    data.map(async (report) => {
      if (report.content_type === "post") {
        const { data: post } = await supabase
          .from("posts")
          .select(`
            title,
            content,
            author:profiles!author_id(username, avatar_url)
          `)
          .eq("id", report.content_id)
          .single()

        return {
          ...report,
          content: post,
        }
      } else if (report.content_type === "comment") {
        const { data: comment } = await supabase
          .from("comments")
          .select(`
            content,
            author:profiles!author_id(username, avatar_url)
          `)
          .eq("id", report.content_id)
          .single()

        return {
          ...report,
          content: comment,
        }
      }

      return report
    }),
  )

  return reportsWithContent
}

// Обработка на докладвано съдържание
export async function handleReport(reportId: string, action: "approve" | "dismiss") {
  await checkModeratorAccess()

  const supabase = createServerClient()

  // Първо получаваме доклада
  const { data: report } = await supabase
    .from("content_reports")
    .select("content_type, content_id")
    .eq("id", reportId)
    .single()

  if (!report) {
    return { error: "Докладът не е намерен" }
  }

  // Обновяваме статуса на доклада
  const { error: updateError } = await supabase
    .from("content_reports")
    .update({
      status: action === "approve" ? "resolved" : "dismissed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)

  if (updateError) {
    console.error("Error updating report:", updateError)
    return { error: updateError.message }
  }

  // Ако одобряваме доклада, скриваме съдържанието
  if (action === "approve") {
    const table = report.content_type === "post" ? "posts" : "comments"

    const { error: contentError } = await supabase
      .from(table)
      .update({
        is_hidden: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", report.content_id)

    if (contentError) {
      console.error(`Error hiding ${report.content_type}:`, contentError)
      return { error: contentError.message }
    }
  }

  revalidatePath("/admin/moderation")
  return { success: true }
}

// Получаване на настройките на сайта
export async function getSiteSettings(): Promise<AdminSettings | null> {
  await checkAdminAccess()

  const supabase = createServerClient()

  const { data, error } = await supabase.from("site_settings").select("*").single()

  if (error) {
    console.error("Error fetching site settings:", error)
    return null
  }

  return {
    id: data.id,
    siteName: data.site_name,
    siteDescription: data.site_description,
    allowRegistration: data.allow_registration,
    requireEmailVerification: data.require_email_verification,
    allowGuestViewing: data.allow_guest_viewing,
    defaultUserRole: data.default_user_role as UserRole,
    postModeration: data.post_moderation as "pre" | "post" | "none",
    commentModeration: data.comment_moderation as "pre" | "post" | "none",
    maxReportsBeforeHidden: data.max_reports_before_hidden,
    updated_at: data.updated_at,
  }
}

// Обновяване на настройките на сайта
export async function updateSiteSettings(settings: Partial<AdminSettings>) {
  await checkAdminAccess()

  const supabase = createServerClient()

  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: settings.siteName,
      site_description: settings.siteDescription,
      allow_registration: settings.allowRegistration,
      require_email_verification: settings.requireEmailVerification,
      allow_guest_viewing: settings.allowGuestViewing,
      default_user_role: settings.defaultUserRole,
      post_moderation: settings.postModeration,
      comment_moderation: settings.commentModeration,
      max_reports_before_hidden: settings.maxReportsBeforeHidden,
    })
    .eq("id", settings.id)

  if (error) {
    console.error("Error updating site settings:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}

// Докладване на съдържание (за потребители)
export async function reportContent(
  contentType: "post" | "comment",
  contentId: string,
  reason: string,
  details?: string,
) {
  const user = await getUser()

  if (!user) {
    return { error: "Трябва да сте влезли в профила си, за да докладвате съдържание" }
  }

  const supabase = createServerClient()

  // Проверка дали потребителят вече е докладвал това съдържание
  const { data: existingReport } = await supabase
    .from("content_reports")
    .select("id")
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .eq("reporter_id", user.id)
    .maybeSingle()

  if (existingReport) {
    return { error: "Вече сте докладвали това съдържание" }
  }

  // Създаване на нов доклад
  const { error } = await supabase.from("content_reports").insert({
    content_type: contentType,
    content_id: contentId,
    reporter_id: user.id,
    reason,
    details,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error reporting content:", error)
    return { error: error.message }
  }

  return { success: true }
}
