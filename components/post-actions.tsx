"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Archive } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface PostActionsProps {
  postId: string
  postSlug: string
  isAuthor: boolean
  isAdmin?: boolean
}

export function PostActions({ postId, postSlug, isAuthor, isAdmin = false }: PostActionsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully.",
      })
      router.push("/my-posts")
      router.refresh()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleArchive = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/archive`, {
        method: "PATCH",
      })

      if (!response.ok) {
        throw new Error("Failed to archive post")
      }

      toast({
        title: "Post archived",
        description: "Your post has been archived successfully.",
      })
      router.push("/my-posts")
      router.refresh()
    } catch (error) {
      console.error("Error archiving post:", error)
      toast({
        title: "Error",
        description: "Failed to archive post. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsArchiveDialogOpen(false)
    }
  }

  if (!isAuthor && !isAdmin) return null

  return (
    <>
      <div className="flex space-x-2">
        <Link href={`/post/edit/${postId}`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-700"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
        <Button variant="outline" size="sm" onClick={() => setIsArchiveDialogOpen(true)}>
          <Archive className="h-4 w-4 mr-1" />
          Archive
        </Button>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-red-500 hover:bg-red-600">
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to archive this post?</AlertDialogTitle>
            <AlertDialogDescription>
              Archiving will hide this post from public view, but you can restore it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive} disabled={isLoading}>
              {isLoading ? "Archiving..." : "Archive"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
