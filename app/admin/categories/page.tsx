import type { Metadata } from "next"
import { CategoryManagement } from "@/components/admin/category-management"

export const metadata: Metadata = {
  title: "Управление на категории | IT Community Forum",
  description: "Управление на категории в IT Community Forum",
}

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Управление на категории</h1>
        <p className="text-muted-foreground">Създаване и редактиране на категории във форума</p>
      </div>

      <CategoryManagement />
    </div>
  )
}
