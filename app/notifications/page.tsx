import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { getUserNotifications } from "@/app/actions/notifications"
import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { createServerClient } from "@/lib/supabase"
import { MarkAllReadButton } from "@/components/mark-all-read-button"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export default async function NotificationsPage() {
  try {
    const user = await getUser()

    if (!user) {
      redirect("/login?redirect=/notifications")
    }

    const notifications = await getUserNotifications(50) // Get up to 50 notifications

    // Проверяваме валидността на линковете към постове
    const supabase = createServerClient()
    const validatedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        try {
          if (notification.link && notification.link.includes("/post/")) {
            const match = notification.link.match(/\/post\/([^#]+)/)
            if (match && match[1]) {
              const slug = match[1]

              const { data, error } = await supabase.from("posts").select("id, title").eq("slug", slug).maybeSingle()

              if (error || !data) {
                // Ако постът не съществува, променяме линка към началната страница
                return {
                  ...notification,
                  link: "/",
                  content: notification.content + " (Постът вече не съществува)",
                }
              }
            }
          }
          return notification
        } catch (error) {
          console.error("Error validating notification link:", error)
          return notification
        }
      }),
    )

  const getNotificationIcon = (type: string | undefined) => {
    switch (type) {
      case "comment":
        return "💬"
      case "mention":
        return "📣"
      case "vote":
        return "👍"
      case "bookmark":
        return "🔖"
      case "follow":
        return "👤"
      case "report":
        return "🚩"
      default:
        return "🔔"
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to forum
        </Link>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated with activity related to your posts and comments
            </p>
          </div>
          <MarkAllReadButton />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your notifications</CardTitle>
          <CardDescription>You have {validatedNotifications.length} notifications</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {validatedNotifications.length > 0 ? (
            validatedNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.link || "#"}
                className={`block p-4 rounded-md border ${
                  notification.is_read ? "bg-card" : "bg-muted/50"
                } hover:bg-accent transition-colors`}
              >
                <div className="flex gap-3">
                  <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm ${notification.is_read ? "" : "font-medium"}`}>{notification.content}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No notifications</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
  } catch (error) {
    console.error("Error loading notifications page:", error)
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to forum
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground">Error loading notifications. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}
