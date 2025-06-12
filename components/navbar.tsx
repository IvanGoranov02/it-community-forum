"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/context/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { MobileNav } from "@/components/mobile-nav"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { NotificationButton } from "@/components/notification-button"

interface NavbarProps {
  className?: string
  items?: {
    path: string
    title: string
    icon?: React.ReactNode
  }[]
}

export function Navbar({ className, items = [] }: NavbarProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  // Check for success or error messages in URL
  useEffect(() => {
    if (!isMounted) return
    
    const message = searchParams?.get("message")
    
    // Handle different message types
    if (message === "login-success") {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
    } else if (message === "email-confirmed") {
      toast({
        title: "Email Confirmed",
        description: "Your email has been confirmed. You are now logged in.",
      })
    } else if (message === "logout-success") {
      toast({
        title: "Logout Successful",
        description: "You have been logged out.",
      })
    }
    
    // Clear the query parameter after showing the toast
    if (message && window.history.replaceState) {
      window.history.replaceState(
        null,
        "",
        pathname
      )
    }
  }, [toast, pathname, searchParams, isMounted])
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background", className)}>
      <div className="container flex h-16 items-center">
        <div className="hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold hidden sm:inline-block text-lg">IT Community Forum</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {items?.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary flex items-center space-x-1",
                  pathname === item.path
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" className="px-2 mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav items={items} />
          </SheetContent>
        </Sheet>
        <Link href="/" className="md:hidden flex items-center">
          <span className="font-bold text-lg">IT Community Forum</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            {user ? (
              <>
                <NotificationButton />
                <ProfileDropdown user={user} />
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
} 