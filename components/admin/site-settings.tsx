"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSiteSettings, updateSiteSettings } from "@/app/actions/admin"
import { useToast } from "@/hooks/use-toast"
import type { AdminSettings } from "@/types/admin"

export function SiteSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      const data = await getSiteSettings()
      setSettings(data)
      setIsLoading(false)
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    const result = await updateSiteSettings(settings)
    setIsSaving(false)

    if (result.error) {
      toast({
        title: "Грешка",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успех",
        description: "Настройките бяха запазени успешно",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Настройки на сайта</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Настройки на сайта</CardTitle>
          <CardDescription>Грешка при зареждане на настройките</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки на сайта</CardTitle>
        <CardDescription>Управление на основните настройки на форума</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
            <TabsTrigger value="general" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">General</span>
              <span className="xs:hidden">General</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Users</span>
              <span className="xs:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Moderation</span>
              <span className="xs:hidden">Mod.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Име на сайта</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Описание на сайта</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between space-y-0 pt-4">
              <Label htmlFor="allowGuestViewing">Разрешаване на преглед от гости</Label>
              <Switch
                id="allowGuestViewing"
                checked={settings.allowGuestViewing}
                onCheckedChange={(checked) => setSettings({ ...settings, allowGuestViewing: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between space-y-0">
              <Label htmlFor="allowRegistration">Разрешаване на регистрация</Label>
              <Switch
                id="allowRegistration"
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-y-0 pt-4">
              <Label htmlFor="requireEmailVerification">Изискване на потвърждение на имейл</Label>
              <Switch
                id="requireEmailVerification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="defaultUserRole">Роля по подразбиране за нови потребители</Label>
              <Select
                value={settings.defaultUserRole}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultUserRole: value as "member" | "moderator" | "admin" })
                }
              >
                <SelectTrigger id="defaultUserRole">
                  <SelectValue placeholder="Изберете роля" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Потребител</SelectItem>
                  <SelectItem value="moderator">Модератор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postModeration">Модерация на постове</Label>
              <Select
                value={settings.postModeration}
                onValueChange={(value) =>
                  setSettings({ ...settings, postModeration: value as "pre" | "post" | "none" })
                }
              >
                <SelectTrigger id="postModeration">
                  <SelectValue placeholder="Изберете тип модерация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без модерация</SelectItem>
                  <SelectItem value="post">След публикуване</SelectItem>
                  <SelectItem value="pre">Преди публикуване</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Определя дали постовете трябва да бъдат одобрени преди да станат видими
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="commentModeration">Модерация на коментари</Label>
              <Select
                value={settings.commentModeration}
                onValueChange={(value) =>
                  setSettings({ ...settings, commentModeration: value as "pre" | "post" | "none" })
                }
              >
                <SelectTrigger id="commentModeration">
                  <SelectValue placeholder="Изберете тип модерация" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без модерация</SelectItem>
                  <SelectItem value="post">След публикуване</SelectItem>
                  <SelectItem value="pre">Преди публикуване</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Определя дали коментарите трябва да бъдат одобрени преди да станат видими
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="maxReportsBeforeHidden">Брой доклади преди автоматично скриване</Label>
              <Input
                id="maxReportsBeforeHidden"
                type="number"
                min="1"
                max="100"
                value={settings.maxReportsBeforeHidden}
                onChange={(e) => setSettings({ ...settings, maxReportsBeforeHidden: Number.parseInt(e.target.value) })}
              />
              <p className="text-sm text-muted-foreground">
                Брой доклади, след които съдържанието се скрива автоматично
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? "Запазване..." : "Запази настройките"}
        </Button>
      </CardFooter>
    </Card>
  )
}
