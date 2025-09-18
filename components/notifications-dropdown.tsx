"use client"

import { useState, useEffect, useRef } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { createBrowserClient } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/app/actions/notifications"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

interface Notification {
  id: string
  content: string
  link: string | null
  is_read: boolean
  created_at: string
  type: string
}

interface NotificationsDropdownProps {
  userId: string
  initialNotifications: Notification[]
  initialUnreadCount: number
}

export function NotificationsDropdown({
  userId,
  initialNotifications,
  initialUnreadCount,
}: NotificationsDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications || [])
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount || 0)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const subscriptionRef = useRef<any>(null)
  const isSubscribedRef = useRef(false)

  console.log("NotificationsDropdown mounted with:", {
    userId,
    initialNotificationsCount: initialNotifications?.length || 0,
    initialUnreadCount,
  })
  
  console.log("Initial Notifications:", initialNotifications)

  useEffect(() => {
    if (!userId || isSubscribedRef.current) return

    try {
      const supabase = createBrowserClient()
      let isMounted = true
      isSubscribedRef.current = true
      console.log("Setting up realtime subscription for user:", userId)

      // Test if Realtime is connected
      const channels = supabase.realtime.getChannels()
      console.log("Realtime state:", {
        channels: channels.length,
        channelsState: channels.length ? channels.map(c => c.state) : 'no channels'
      })

      // Subscribe to new notifications
      const channel = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("Received new notification:", payload)
            if (isMounted && payload.new) {
              const newNotification = {
                ...payload.new,
                type: payload.new.type || 'system',
                link: payload.new.link || null,
                is_read: payload.new.is_read || false,
              } as Notification
              setNotifications((prev) => [newNotification, ...prev].slice(0, 10))
              setUnreadCount((prev) => prev + 1)
            }
          },
        )
        .subscribe((status) => {
          console.log("Realtime subscription status:", status)
        })

      console.log("Realtime subscription activated, channel state:", channel.state)
      subscriptionRef.current = channel

      return () => {
        console.log("Cleaning up realtime subscription")
        isMounted = false
        isSubscribedRef.current = false
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current)
          subscriptionRef.current = null
        }
      }
    } catch (error) {
      console.error("Error setting up realtime subscription:", error)
    }
  }, [userId])

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Prevent multiple clicks
      if (isOpen === false) return
      
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id)
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }

      if (notification.link) {
        // Close dropdown first to prevent state issues
        setIsOpen(false)
        
        // Simple navigation without complex validation
        router.push(notification.link)
      } else {
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error handling notification click:", error)
      setIsOpen(false)
      toast({
        title: "Грешка",
        description: "Възникна проблем при обработката на известието",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast({
        title: "Успех",
        description: "Всички известия са маркирани като прочетени",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Грешка",
        description: "Възникна проблем при маркирането на известията като прочетени",
        variant: "destructive",
      })
    }
  }

  const getNotificationIcon = (type: string) => {
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
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer ${notification.is_read ? "" : "bg-muted/50"}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex gap-3 w-full">
                  <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm ${notification.is_read ? "" : "font-medium"}`}>{notification.content}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(notification.created_at)}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/notifications" className="w-full p-4 text-center text-sm text-primary">
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>No notifications</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
