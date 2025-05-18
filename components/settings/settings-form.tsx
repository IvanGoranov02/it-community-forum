"use client"

import type React from "react"

import { useState } from "react"
import { updateUserSettings } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface SettingsFormProps {
  settings: any
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("notifications")
  const [formState, setFormState] = useState({
    theme: settings?.theme || "system",
    language: settings?.language || "bg",
    email_notifications: settings?.email_notifications || false,
    marketing_emails: settings?.marketing_emails || false,
    activity_summary: settings?.activity_summary || false,
  })

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const result = await updateUserSettings(formData)

      if (result.error) {
        toast({
          title: "Грешка",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Настройките са запазени",
          description: "Вашите предпочитания са актуализирани успешно.",
        })
      }
    } catch (error) {
      toast({
        title: "Грешка",
        description: "Възникна проблем при запазване на настройките.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="notifications">Известия</TabsTrigger>
        <TabsTrigger value="appearance">Външен вид</TabsTrigger>
        <TabsTrigger value="account">Акаунт</TabsTrigger>
      </TabsList>

      <form onSubmit={handleSubmit} className="space-y-8 pt-6">
        <TabsContent value="notifications" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Настройки на известията</h3>
            <p className="text-sm text-muted-foreground">Конфигурирайте как искате да получавате известия.</p>
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications" className="text-base">
                Имейл известия
              </Label>
              <p className="text-sm text-muted-foreground">Получавайте имейли за нови отговори на вашите публикации.</p>
            </div>
            <Switch
              id="email_notifications"
              name="email_notifications"
              checked={formState.email_notifications}
              onCheckedChange={(checked) => setFormState({ ...formState, email_notifications: checked })}
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="activity_summary" className="text-base">
                Седмично обобщение
              </Label>
              <p className="text-sm text-muted-foreground">Получавайте седмично обобщение на активността във форума.</p>
            </div>
            <Switch
              id="activity_summary"
              name="activity_summary"
              checked={formState.activity_summary}
              onCheckedChange={(checked) => setFormState({ ...formState, activity_summary: checked })}
            />
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="marketing_emails" className="text-base">
                Маркетингови имейли
              </Label>
              <p className="text-sm text-muted-foreground">Получавайте имейли за нови функции и специални оферти.</p>
            </div>
            <Switch
              id="marketing_emails"
              name="marketing_emails"
              checked={formState.marketing_emails}
              onCheckedChange={(checked) => setFormState({ ...formState, marketing_emails: checked })}
            />
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Външен вид</h3>
            <p className="text-sm text-muted-foreground">Персонализирайте как изглежда форумът за вас.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Тема</Label>
              <Select
                name="theme"
                value={formState.theme}
                onValueChange={(value) => setFormState({ ...formState, theme: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете тема" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Светла</SelectItem>
                  <SelectItem value="dark">Тъмна</SelectItem>
                  <SelectItem value="system">Системна</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Изберете предпочитаната от вас тема за форума.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Език</Label>
              <Select
                name="language"
                value={formState.language}
                onValueChange={(value) => setFormState({ ...formState, language: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Изберете език" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg">Български</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Това е езикът, на който ще виждате интерфейса на форума.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Настройки на акаунта</h3>
            <p className="text-sm text-muted-foreground">Управлявайте настройките на вашия акаунт.</p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="text-sm font-medium">Опасна зона</h4>
            <p className="text-sm text-muted-foreground mt-1 mb-4">Внимание: Тези действия са необратими.</p>
            <Button type="button" variant="destructive">
              Изтриване на акаунта
            </Button>
          </div>
        </TabsContent>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Запази настройките
          </Button>
        </div>
      </form>
    </Tabs>
  )
}
