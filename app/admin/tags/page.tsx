import type { Metadata } from "next"
import { TagManagement } from "@/components/admin/tag-management"

export const metadata: Metadata = {
  title: "Управление на тагове | IT Community Forum",
  description: "Управление на тагове в IT Community Forum",
}

export default function AdminTagsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Управление на тагове</h1>
        <p className="text-muted-foreground">Създаване и редактиране на тагове във форума</p>
      </div>

      <TagManagement />
    </div>
  )
}
