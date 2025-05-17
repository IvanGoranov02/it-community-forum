"use server"

import { createNotification } from "@/app/actions/notifications"
import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export async function createTestNotification() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  await createNotification(
    user.id,
    "This is a test notification to verify the system works!",
    "/notifications",
    "system",
  )

  redirect("/notifications")
}
