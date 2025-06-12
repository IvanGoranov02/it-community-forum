"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { getPostSettings, updatePostSettings } from "@/app/actions/admin"
import type { PostSettings } from "@/types/admin"

export function PostSettingsPanel() {
  const [settings, setSettings] = useState<PostSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      const data = await getPostSettings()
      setSettings(data)
      setIsLoading(false)
    }

    fetchSettings()
  }, [])

  const handleSaveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    const result = await updatePostSettings(settings)
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
          <CardTitle>Настройки на постовете</CardTitle>
          <CardDescription>Loading settings...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Настройки на постовете</CardTitle>
          <CardDescription>Грешка при зареждане на настройките</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Настройки на постовете</CardTitle>
        <CardDescription>Управление на правата и настройките на постовете</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="permissions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
            <TabsTrigger value="permissions" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Permissions</span>
              <span className="xs:hidden">Perms</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Content</span>
              <span className="xs:hidden">Content</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="text-xs sm:text-sm py-2">
              <span className="hidden xs:inline">Moderation</span>
              <span className="xs:hidden">Mod.</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minRoleToCreatePosts">Минимална роля за създаване на постове</Label>
              <Select
                value={settings.minRoleToCreatePosts}
                onValueChange={(value) =>
                  setSettings({
                    ...settings,
                    minRoleToCreatePosts: value as "guest" | "member" | "moderator" | "admin",
                  })
                }
              >
                <SelectTrigger id="minRoleToCreatePosts">
                  <SelectValue placeholder="Изберете роля" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Гост</SelectItem>
                  <SelectItem value="member">Потребител</SelectItem>
                  <SelectItem value="moderator">Модератор</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="minRoleToComment">Минимална роля за коментиране</Label>
              <Select
                value={settings.minRoleToComment}
                onValueChange={(value) =>
                  setSettings({ ...settings, minRoleToComment: value as "guest" | "member" | "moderator" | "admin" })
                }
              >
                <SelectTrigger id="minRoleToComment">
                  <SelectValue placeholder="Изберете роля" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Гост</SelectItem>
                  <SelectItem value="member">Потребител</SelectItem>
                  <SelectItem value="moderator">Модератор</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between space-y-0 pt-4">
              <Label htmlFor="allowGuestVoting">Разрешаване на гласуване от гости</Label>
              <Switch
                id="allowGuestVoting"
                checked={settings.allowGuestVoting}
                onCheckedChange={(checked) => setSettings({ ...settings, allowGuestVoting: checked })}
              />
            </div>

            <div className="flex items-center justify-between space-y-0 pt-4">
              <Label htmlFor="allowSelfVoting">Разрешаване на гласуване за собствени постове</Label>
              <Switch
                id="allowSelfVoting"
                checked={settings.allowSelfVoting}
                onCheckedChange={(checked) => setSettings({ ...settings, allowSelfVoting: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minPostLength">Минимална дължина на пост (символи)</Label>
              <Input
                id="minPostLength"
                type="number"
                min="1"
                max="1000"
                value={settings.minPostLength}
                onChange={(e) => setSettings({ ...settings, minPostLength: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="maxPostLength">Максимална дължина на пост (символи)</Label>
              <Input
                id="maxPostLength"
                type="number"
                min="100"
                max="100000"
                value={settings.maxPostLength}
                onChange={(e) => setSettings({ ...settings, maxPostLength: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="minCommentLength">Минимална дължина на коментар (символи)</Label>
              <Input
                id="minCommentLength"
                type="number"
                min="1"
                max="500"
                value={settings.minCommentLength}
                onChange={(e) => setSettings({ ...settings, minCommentLength: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="maxCommentLength">Максимална дължина на коментар (символи)</Label>
              <Input
                id="maxCommentLength"
                type="number"
                min="100"
                max="10000"
                value={settings.maxCommentLength}
                onChange={(e) => setSettings({ ...settings, maxCommentLength: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="maxTagsPerPost">Максимален брой тагове на пост</Label>
              <Input
                id="maxTagsPerPost"
                type="number"
                min="1"
                max="20"
                value={settings.maxTagsPerPost}
                onChange={(e) => setSettings({ ...settings, maxTagsPerPost: Number.parseInt(e.target.value) })}
              />
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
              <Label htmlFor="forbiddenWords">Забранени думи (разделени със запетая)</Label>
              <Input
                id="forbiddenWords"
                value={settings.forbiddenWords.join(", ")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    forbiddenWords: e.target.value.split(",").map((word) => word.trim()),
                  })
                }
              />
              <p className="text-sm text-muted-foreground">
                Думи, които ще бъдат автоматично филтрирани от постовете и коментарите
              </p>
            </div>

            <div className="flex items-center justify-between space-y-0 pt-4">
              <Label htmlFor="enableAutoModeration">Включване на автоматична модерация</Label>
              <Switch
                id="enableAutoModeration"
                checked={settings.enableAutoModeration}
                onCheckedChange={(checked) => setSettings({ ...settings, enableAutoModeration: checked })}
              />
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
