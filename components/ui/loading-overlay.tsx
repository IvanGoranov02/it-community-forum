import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
}

export function LoadingOverlay({ isLoading, text }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300"
      style={{ opacity: isLoading ? 1 : 0 }}
    >
      <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-lg shadow-lg border animate-in fade-in zoom-in-95 duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {text && <p className="text-lg font-medium text-center">{text}</p>}
      </div>
    </div>
  )
}
