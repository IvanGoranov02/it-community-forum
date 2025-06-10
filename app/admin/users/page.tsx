import type { Metadata } from "next"
import { UserManagement } from "@/components/admin/user-management"

export const metadata: Metadata = {
  title: "Управление на потребители | IT Community Forum",
  description: "Управление на потребителски акаунти в IT Community Forum",
}

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Управление на потребители</h1>
        <p className="text-muted-foreground">Управление на потребителски акаунти и роли</p>
      </div>

      <UserManagement />
    </div>
  )
}
