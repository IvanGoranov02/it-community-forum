import { LoadingSpinner } from "@/components/ui/loading-spinner"

interface LoadingOverlayProps {
  isLoading: boolean
  text?: string
}

export function LoadingOverlay({ isLoading, text }: LoadingOverlayProps) {
  // DISABLED: Always return null to prevent stuck loading screens
  return null
}
