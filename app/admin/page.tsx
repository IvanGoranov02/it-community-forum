import type { Metadata } from "next"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { getAdminStats } from "@/app/actions/admin"

export const metadata: Metadata = {
  title: "Административно табло | IT Community Forum",
  description: "Административно табло за управление на IT Community Forum",
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Административно табло</h1>
        <p className="text-muted-foreground">Общ преглед на форума и статистика</p>
      </div>

      <DashboardStats stats={stats} />
    </div>
  )
}
