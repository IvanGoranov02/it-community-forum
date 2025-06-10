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
import { LogOut, Settings, MessageSquare, UserCircle, Bookmark, Shield, Sun, Moon } from "lucide-react"
import { useLoading } from "@/app/context/loading-context"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

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
  const { theme, setTheme } = useTheme()

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
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

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
      
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
    

          {/* Show admin panel link only for administrators */}
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

          {/* Show moderation link only for moderators */}
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
          <DropdownMenuItem>
            <button onClick={toggleTheme} className="cursor-pointer flex w-full items-center">
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button onClick={handleLogout} className="flex w-full items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
