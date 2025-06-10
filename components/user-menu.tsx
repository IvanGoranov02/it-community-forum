"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/app/actions/auth"
import { LogOut, Settings, MessageSquare, UserCircle, Bookmark, Shield } from "lucide-react"
import { useLoading } from "@/app/context/loading-context"
import { useRouter } from "next/navigation"

interface UserMenuProps {
  user: {
    id: string
    name: string
    email: string
    username: string
    avatar?: string
    role?: string
  } | null
}

export function UserMenu({ user }: UserMenuProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login">
          <Button variant="ghost">Sign In</Button>
        </Link>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </div>
    )
  }

  const isAdmin = user.role === "admin"
  const isModerator = user.role === "moderator"

  const { startLoading, stopLoading } = useLoading()
  const router = useRouter()

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault()
    startLoading("Logging out...")
    try {
      await logout()
      localStorage.removeItem("supabase-auth")
      window.location.reload()
    } finally {
      stopLoading()
    }
  }

  const handleNavigate = (href: string) => (e: React.MouseEvent) => {
    router.push(href)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={user.avatar || `/placeholder.svg?height=40&width=40&query=${user.name}`}
              alt={user.name}
            />
            <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <button onClick={handleNavigate(`/profile/${user.username}`)} className="cursor-pointer flex w-full items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button onClick={handleNavigate("/my-posts")} className="cursor-pointer flex w-full items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>My Posts</span>
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <button onClick={handleNavigate("/bookmarks")} className="cursor-pointer flex w-full items-center">
            <Bookmark className="mr-2 h-4 w-4" />
            <span>Bookmarks</span>
          </button>
        </DropdownMenuItem>
  

        {/* Показване на връзка към админ панела само за администратори */}
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button onClick={handleNavigate("/admin")} className="cursor-pointer flex w-full items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Admin Panel</span>
              </button>
            </DropdownMenuItem>
          </>
        )}

        {/* Показване на връзка към модераторския панел само за модератори */}
        {isModerator && !isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <button onClick={handleNavigate("/admin/moderation")} className="cursor-pointer flex w-full items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Moderation</span>
              </button>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <button onClick={handleLogout} className="flex w-full items-center">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
