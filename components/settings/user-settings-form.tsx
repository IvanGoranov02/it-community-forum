"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateUserSettings } from "@/app/actions/settings"
import { Loader2 } from "lucide-react"

interface UserSettingsFormProps {
  initialSettings: {
    emailNotifications: boolean
    marketingEmails: boolean
    activitySummary: boolean
    theme: string
    language: string
  }
}

export function UserSettingsForm({ initialSettings }: UserSettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await updateUserSettings(settings)
      toast({
        title: "Настройките са запазени",
        description: "Вашите настройки бяха успешно актуализирани.",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Възникна проблем при запазването на настройките.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Известия</TabsTrigger>
          <TabsTrigger value="appearance">Външен вид</TabsTrigger>
          <TabsTrigger value="account">Акаунт</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Настройки на известията</CardTitle>
              <CardDescription>Управлявайте как и кога получавате известия.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="emailNotifications" className="flex-1">
                  Имейл известия
                  <p className="text-sm text-muted-foreground">
                    Получавайте известия по имейл за активност във форума.
                  </p>
                </Label>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="activitySummary" className="flex-1">
                  Седмично обобщение
                  <p className="text-sm text-muted-foreground">
                    Получавайте седмично обобщение на активността във форума.
                  </p>
                </Label>
                <Switch
                  id="activitySummary"
                  checked={settings.activitySummary}
                  onCheckedChange={(checked) => setSettings({ ...settings, activitySummary: checked })}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="marketingEmails" className="flex-1">
                  Маркетингови имейли
                  <p className="text-sm text-muted-foreground">Получавайте информация за нови функции и събития.</p>
                </Label>
                <Switch
                  id="marketingEmails"
                  checked={settings.marketingEmails}
                  onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Външен вид</CardTitle>
              <CardDescription>Персонализирайте как изглежда форумът за вас.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Тема</Label>
                <select
                  id="theme"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={settings.theme}
                  onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                >
                  <option value="system">Системна (по подразбиране)</option>
                  <option value="light">Светла</option>
                  <option value="dark">Тъмна</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Език</Label>
                <select
                  id="language"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                >
                  <option value="bg">Български</option>
                  <option value="en">English</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Настройки на акаунта</CardTitle>
              <CardDescription>Управлявайте настройките на вашия акаунт.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Потребителско име</Label>
                <p className="text-sm text-muted-foreground">
                  За да промените потребителското си име, моля посетете страницата за редактиране на профила.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Имейл адрес</Label>
                <p className="text-sm text-muted-foreground">
                  За да промените имейл адреса си, моля свържете се с администратор.
                </p>
              </div>

              <div className="pt-4">
                <Button variant="outline" className="w-full text-destructive hover:bg-destructive/10" type="button">
                  Изтриване на акаунт
                </Button>
                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Това действие е необратимо и ще изтрие всички ваши данни.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Запази настройките
        </Button>
      </div>
    </form>
  )
}
