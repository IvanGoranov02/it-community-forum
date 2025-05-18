import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
}

export function LoadingOverlay({ isLoading, text }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-6 bg-background rounded-lg shadow-lg">
        <LoadingSpinner size="xl" />
        {text && <p className="text-lg font-medium">{text}</p>}
      </div>
    </div>
  )
}
