import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getUser } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { LayoutDashboard, Users, Shield, Tag, FolderTree, Settings, Home, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Административен панел | IT Community Forum",
  description: "Административен панел за управление на IT Community Forum",
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect("/login?redirect=/admin")
  }

  // Проверка дали потребителят е администратор
  const supabase = createServerClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <Shield className="h-6 w-6 text-primary" />
            <div className="font-semibold">Админ панел</div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Табло</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/users">
                  <Users className="h-4 w-4" />
                  <span>Потребители</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/moderation">
                  <Shield className="h-4 w-4" />
                  <span>Модерация</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/categories">
                  <FolderTree className="h-4 w-4" />
                  <span>Категории</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/tags">
                  <Tag className="h-4 w-4" />
                  <span>Тагове</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/database">
                  <Database className="h-4 w-4" />
                  <span>База данни</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4" />
                  <span>Настройки</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="p-4">
            <Link href="/">
              <Button variant="outline" className="w-full flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Към форума</span>
              </Button>
            </Link>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  )
}
