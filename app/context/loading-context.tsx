"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { LoadingOverlay } from "@/components/ui/loading-overlay"

interface LoadingContextType {
  isLoading: boolean
  startLoading: (text?: string) => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined)

  // Only allow loading for post creation and similar important operations
  const allowedLoadingTexts = [
    "Creating post...",
    "Updating post...",
    "Deleting post...",
    "Uploading image...",
  ]

  const startLoading = (text?: string) => {
    setLoadingText(text)
    setIsLoading(true)
  }

  const stopLoading = () => {
    setIsLoading(false)
    setLoadingText(undefined)
  }

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingOverlay 
        isLoading={isLoading} 
        text={loadingText} 
        allowedTexts={allowedLoadingTexts}
      />
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}
