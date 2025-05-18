"use client"

import { createPortal } from "react-dom"
import { useEffect, useState } from "react"
import { LoadingSpinner } from "./loading-spinner"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
  className?: string
  blur?: boolean
}

export function LoadingOverlay({ isLoading, text, className, blur = true }: LoadingOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted || !isLoading) return null

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80",
        blur && "backdrop-blur-sm",
        className,
      )}
    >
      <LoadingSpinner size="lg" text={text} />
    </div>,
    document.body,
  )
}
