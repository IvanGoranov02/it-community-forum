"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUserSettings } from "@/app/actions/settings"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

const settingsFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Моля, изберете тема.",
  }),
  language: z.string({
    required_error: "Моля, изберете език.",
  }),
  emailNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
  activitySummary: z.boolean().default(true),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

interface UserSettingsFormProps {
  initialSettings: {
    theme: string
    language: string
    emailNotifications: boolean
    marketingEmails: boolean
    activitySummary: boolean
  }
}

export function UserSettingsForm({ initialSettings }: UserSettingsFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("notifications")

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      theme: initialSettings.theme as "light" | "dark" | "system",
      language: initialSettings.language,
      emailNotifications: initialSettings.emailNotifications,
      marketingEmails: initialSettings.marketingEmails,
      activitySummary: initialSettings.activitySummary,
    },
  })

  async function onSubmit(data: SettingsFormValues) {
    setIsLoading(true)
    try {
      const result = await updateUserSettings(data)

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
      <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto">
        <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2">
          <span className="hidden xs:inline">Notifications</span>
          <span className="xs:hidden">Notif.</span>
        </TabsTrigger>
        <TabsTrigger value="appearance" className="text-xs sm:text-sm py-2">
          <span className="hidden xs:inline">Appearance</span>
          <span className="xs:hidden">Theme</span>
        </TabsTrigger>
        <TabsTrigger value="account" className="text-xs sm:text-sm py-2">
          <span className="hidden xs:inline">Account</span>
          <span className="xs:hidden">Account</span>
        </TabsTrigger>
      </TabsList>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pt-6">
          <TabsContent value="notifications" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Настройки на известията</h3>
              <p className="text-sm text-muted-foreground">Конфигурирайте как искате да получавате известия.</p>
            </div>
            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Имейл известия</FormLabel>
                    <FormDescription>Получавайте имейли за нови отговори на вашите публикации.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activitySummary"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Седмично обобщение</FormLabel>
                    <FormDescription>Получавайте седмично обобщение на активността във форума.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="marketingEmails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Маркетингови имейли</FormLabel>
                    <FormDescription>Получавайте имейли за нови функции и специални оферти.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="appearance" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Външен вид</h3>
              <p className="text-sm text-muted-foreground">Персонализирайте как изглежда форумът за вас.</p>
            </div>
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Тема</FormLabel>
                  <FormDescription>Изберете предпочитаната от вас тема за форума.</FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-4"
                    >
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="light" className="sr-only" />
                          </FormControl>
                          <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                              <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                            </div>
                          </div>
                          <span className="block w-full p-2 text-center font-normal">Светла</span>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="dark" className="sr-only" />
                          </FormControl>
                          <div className="items-center rounded-md border-2 border-muted bg-popover p-1 hover:bg-accent hover:text-accent-foreground">
                            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                              <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-slate-400" />
                                <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                              </div>
                            </div>
                          </div>
                          <span className="block w-full p-2 text-center font-normal">Тъмна</span>
                        </FormLabel>
                      </FormItem>
                      <FormItem>
                        <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                          <FormControl>
                            <RadioGroupItem value="system" className="sr-only" />
                          </FormControl>
                          <div className="items-center rounded-md border-2 border-muted p-1 hover:border-accent">
                            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                              <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                              <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                                <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                              </div>
                            </div>
                          </div>
                          <span className="block w-full p-2 text-center font-normal">Системна</span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Език</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Изберете език" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bg">Български</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Това е езикът, на който ще виждате интерфейса на форума.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="account" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Настройки на акаунта</h3>
              <p className="text-sm text-muted-foreground">Управлявайте настройките на вашия акаунт.</p>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium">Опасна зона</h4>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Внимание: Тези действия са необратими.</p>
              <Button variant="destructive">Изтриване на акаунта</Button>
            </div>
          </TabsContent>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Запази настройките
            </Button>
          </div>
        </form>
      </Form>
    </Tabs>
  )
}
