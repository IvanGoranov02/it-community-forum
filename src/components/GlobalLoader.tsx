"use client"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export function GlobalLoader() {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timeout = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timeout)
  }, [pathname])

  // Handle Supabase hash fragment for magiclink/recovery globally
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get("access_token")
      const refreshToken = params.get("refresh_token")
      const type = params.get("type")
      // Прехвърляме всички параметри от hash-а към query
      if (accessToken && (type === "recovery" || type === "magiclink")) {
        const query = Array.from(params.entries())
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join("&")
        const url = `/change-password?${query}`
        router.replace(url)
      }
    }
  }, [router, pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
    </div>
  )
} 