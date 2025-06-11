"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TestNotificationsPage() {
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string>("90dbf372-4de8-4b25-94a6-ccea286bbbbb") // Предварително зададено ID
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [notifications, setNotifications] = useState<any[]>([])
  
  // Get the current user
  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createBrowserClient()
        const { data } = await supabase.auth.getSession()
        
        if (data.session) {
          const { data: userData } = await supabase.auth.getUser()
          setUser(userData.user)
        }
        
        // Fetch notifications for the fixed user ID regardless of login state
        await fetchNotifications()
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    loadUser()
  }, [])
  
  async function fetchNotifications() {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10)
        
      if (error) throw error
      
      setNotifications(data || [])
    } catch (err: any) {
      setError(`Error fetching notifications: ${err.message}`)
    }
  }
  
  async function sendTestNotification() {
    try {
      setSuccess("")
      setError("")
      
      const response = await fetch(`/api/send-test-notification?userId=${userId}`)
      const result = await response.json()
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess("Notification sent successfully!")
        // Reload notifications
        await fetchNotifications()
      }
    } catch (err: any) {
      setError(`Error sending notification: ${err.message}`)
    }
  }
  
  // Set up realtime subscription
  useEffect(() => {
    const supabase = createBrowserClient()
    console.log("Setting up realtime subscription for notifications for user:", userId)
    
    const channel = supabase
      .channel("notification_changes")
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
          setNotifications((prev) => [payload.new, ...prev].slice(0, 10))
          setSuccess("New notification received in realtime!")
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
      })
      
    return () => {
      console.log("Cleaning up realtime subscription")
      supabase.removeChannel(channel)
    }
  }, [userId])
  
  if (loading) {
    return <div className="container py-10">Loading...</div>
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Test Notifications</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 border-green-600 bg-green-50 dark:bg-green-900/20">
          <Info className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Send Test Notification</CardTitle>
            <CardDescription>
              Send a test notification to check if the notification system works.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2">User ID:</p>
                <Input 
                  value={userId} 
                  onChange={(e) => setUserId(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Using the fixed user ID: <code className="bg-muted p-1 rounded">90dbf372-4de8-4b25-94a6-ccea286bbbbb</code>
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={sendTestNotification}>Send Test Notification</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Notifications</CardTitle>
            <CardDescription>
              Latest notifications {notifications.length > 0 ? `(${notifications.length})` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 border rounded bg-muted/50">
                    <p className="font-medium">{notification.content}</p>
                    <div className="text-sm text-muted-foreground mt-1 flex justify-between">
                      <span>Link: {notification.link || "none"}</span>
                      <span>Read: {notification.is_read ? "Yes" : "No"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No notifications found.</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={fetchNotifications}>Refresh Notifications</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 