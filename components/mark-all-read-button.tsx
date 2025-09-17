"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { markAllNotificationsAsRead } from "@/app/actions/notifications"
import { toast } from "@/hooks/use-toast"

export function MarkAllReadButton() {
  const handleMarkAllAsRead = async () => {
    try {
      const result = await markAllNotificationsAsRead()
      
      if (result?.error) {
        toast({
          title: "Грешка",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Успех",
          description: "Всички известия са маркирани като прочетени",
        })
        // Refresh the page to show updated notifications
        window.location.reload()
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Грешка",
        description: "Възникна проблем при маркирането на известията като прочетени",
        variant: "destructive",
      })
    }
  }

  return (
    <Button 
      onClick={handleMarkAllAsRead}
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1"
    >
      <Check className="h-4 w-4" />
      Mark all as read
    </Button>
  )
}
