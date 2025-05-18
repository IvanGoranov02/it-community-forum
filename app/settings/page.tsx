import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getUserSettings } from "@/app/actions/settings"
import { getUser } from "@/app/actions/auth"
import { UserSettingsForm } from "@/components/settings/user-settings-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Настройки | IT Community Forum",
  description: "Управлявайте настройките на вашия акаунт",
}

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/settings")
  }

  const settings = (await getUserSettings()) || {
    emailNotifications: true,
    marketingEmails: false,
    activitySummary: true,
    theme: "system",
    language: "bg",
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Назад към форума
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Настройки на акаунта</h1>
        <p className="text-muted-foreground">Управлявайте настройките на вашия акаунт и предпочитания.</p>
      </div>

      <UserSettingsForm initialSettings={settings} />
    </div>
  )
}
