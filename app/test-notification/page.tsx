import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createTestNotification } from "@/app/actions/test-notification"
import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function TestNotificationPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/test-notification")
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>Send a test notification to verify the system works</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Click the button below to send yourself a test notification.</p>
        </CardContent>
        <CardFooter>
          <form action={createTestNotification}>
            <Button type="submit">Send Test Notification</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
