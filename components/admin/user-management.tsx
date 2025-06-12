"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, MoreHorizontal, Shield, User, UserCog, Ban, Unlock } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { getUsers, updateUserRole, toggleUserBan } from "@/app/actions/admin"
import { useToast } from "@/hooks/use-toast"
import type { UserManagementFilters, UserRole } from "@/types/admin"

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<UserManagementFilters>({
    sortBy: "created_at",
    sortOrder: "desc",
  })
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const data = await getUsers(filters)
      setUsers(data)
      setIsLoading(false)
    }

    fetchUsers()
  }, [filters])

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery })
  }

  const handleRoleChange = async (userId: string, role: UserRole) => {
    const result = await updateUserRole(userId, role)

    if (result.error) {
      toast({
        title: "Грешка",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успех",
        description: "Ролята на потребителя беше променена успешно",
      })

      // Обновяване на локалния списък с потребители
      setUsers(users.map((user) => (user.id === userId ? { ...user, role } : user)))
    }
  }

  const handleToggleBan = async (userId: string, isBanned: boolean) => {
    const result = await toggleUserBan(userId, isBanned)

    if (result.error) {
      toast({
        title: "Грешка",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успех",
        description: isBanned ? "Потребителят беше блокиран успешно" : "Потребителят беше разблокиран успешно",
      })

      // Обновяване на локалния списък с потребители
      setUsers(users.map((user) => (user.id === userId ? { ...user, is_banned: isBanned } : user)))
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Администратор</Badge>
      case "moderator":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Модератор</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">Потребител</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление на потребители</CardTitle>
        <CardDescription>Преглед и управление на потребителски акаунти</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex w-full md:w-1/3">
            <Input
              placeholder="Търсене по име или имейл"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-r-none"
            />
            <Button variant="secondary" className="rounded-l-none" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2 w-full md:w-2/3 md:justify-end">
            <Select
              value={filters.role || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, role: value === "all" ? undefined : (value as UserRole) })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Филтър по роля" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Всички роли</SelectItem>
                <SelectItem value="admin">Администратори</SelectItem>
                <SelectItem value="moderator">Модератори</SelectItem>
                <SelectItem value="member">Потребители</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={`${filters.sortBy || "created_at"}-${filters.sortOrder || "desc"}`}
              onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split("-")
                setFilters({
                  ...filters,
                  sortBy: sortBy as "username" | "created_at" | "reputation",
                  sortOrder: sortOrder as "asc" | "desc",
                })
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Сортиране" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Най-нови първо</SelectItem>
                <SelectItem value="created_at-asc">Най-стари първо</SelectItem>
                <SelectItem value="username-asc">Име (А-Я)</SelectItem>
                <SelectItem value="username-desc">Име (Я-А)</SelectItem>
                <SelectItem value="reputation-desc">Репутация (низходящо)</SelectItem>
                <SelectItem value="reputation-asc">Репутация (възходящо)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered on</TableHead>
                <TableHead>Reputation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatar_url || `/placeholder.svg?height=32&width=32&query=${user.username}`}
                            alt={user.username}
                          />
                          <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{user.full_name || user.username}</div>
                          <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell>{user.reputation}</TableCell>
                    <TableCell>
                      {user.is_banned ? (
                        <Badge variant="destructive">Блокиран</Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        >
                          Активен
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Действия</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "admin")}
                            disabled={user.role === "admin"}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Направи администратор</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "moderator")}
                            disabled={user.role === "moderator"}
                          >
                            <UserCog className="mr-2 h-4 w-4" />
                            <span>Направи модератор</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRoleChange(user.id, "member")}
                            disabled={user.role === "member"}
                          >
                            <User className="mr-2 h-4 w-4" />
                            <span>Направи обикновен потребител</span>
                          </DropdownMenuItem>
                          {user.is_banned ? (
                            <DropdownMenuItem onClick={() => handleToggleBan(user.id, false)}>
                              <Unlock className="mr-2 h-4 w-4" />
                              <span>Разблокирай</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleToggleBan(user.id, true)}>
                              <Ban className="mr-2 h-4 w-4" />
                              <span>Блокирай</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
