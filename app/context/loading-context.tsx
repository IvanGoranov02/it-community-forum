"use client"

import { createContext, useContext, type ReactNode } from "react"

interface LoadingContextType {
  isLoading: boolean
  startLoading: (text?: string) => void
  stopLoading: () => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  // Dummy loading functions - no actual loading overlay
  const startLoading = (text?: string) => {
    // Do nothing - loading overlay is disabled
  }

  const stopLoading = () => {
    // Do nothing - loading overlay is disabled  
  }

  return (
    <LoadingContext.Provider value={{ isLoading: false, startLoading, stopLoading }}>
      {children}
      {/* LoadingOverlay permanently disabled to prevent stuck loading screens */}
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
