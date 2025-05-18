import type { Metadata } from "next"
import { SiteSettings } from "@/components/admin/site-settings"

export const metadata: Metadata = {
  title: "Настройки на сайта | IT Community Forum",
  description: "Настройки на IT Community Forum",
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки на сайта</h1>
        <p className="text-muted-foreground">Управление на основните настройки на форума</p>
      </div>

      <SiteSettings />
    </div>
  )
}
