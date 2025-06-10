import type { Metadata } from "next"
import { PostSettingsPanel } from "@/components/admin/post-settings"

export const metadata: Metadata = {
  title: "Настройки на постовете | IT Community Forum",
  description: "Управление на правата и настройките на постовете в IT Community Forum",
}

export default function PostSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки на постовете</h1>
        <p className="text-muted-foreground">Управление на правата и настройките на постовете</p>
      </div>

      <PostSettingsPanel />
    </div>
  )
}
