"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function EditPostError({ error }: { error: string }) {
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    toast({
      title: "Error",
      description: error,
      variant: "destructive",
    })

    // Redirect back to the post list after showing the error
    setTimeout(() => {
      router.push("/my-posts")
    }, 3000)
  }, [error, toast, router])

  return null
}
