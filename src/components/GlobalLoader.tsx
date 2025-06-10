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

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
    </div>
  )
} 