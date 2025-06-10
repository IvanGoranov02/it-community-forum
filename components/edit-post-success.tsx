"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export function EditPostSuccess({ slug }: { slug: string }) {
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    toast({
      title: "Success",
      description: "Post updated successfully",
      variant: "default",
    })

    // Redirect to the post after showing the success message
    setTimeout(() => {
      router.push(`/post/${slug}`)
    }, 1000)
  }, [slug, toast, router])

  return null
}
