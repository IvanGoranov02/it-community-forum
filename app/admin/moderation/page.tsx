import type { Metadata } from "next"
import { ContentModeration } from "@/components/admin/content-moderation"

export const metadata: Metadata = {
  title: "Модерация на съдържание | IT Community Forum",
  description: "Модерация на съдържание в IT Community Forum",
}

export default function AdminModerationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Модерация на съдържание</h1>
        <p className="text-muted-foreground">Преглед и обработка на докладвано съдържание</p>
      </div>

      <ContentModeration />
    </div>
  )
}
