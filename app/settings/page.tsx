import { getUser } from "@/app/actions/auth"
import { getUserSettings } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SettingsForm } from "@/components/settings/settings-form"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/settings")
  }

  const settings = await getUserSettings()

  return (
    <div className="container py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Назад към форума
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Настройки</CardTitle>
          <CardDescription>Управлявайте вашите предпочитания и настройки на акаунта</CardDescription>
        </CardHeader>
        <CardContent>
          <SettingsForm settings={settings} />
        </CardContent>
      </Card>
    </div>
  )
}
