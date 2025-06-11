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
  userEmail?: string
}

export function PostActions({ postId, postSlug, isAuthor, isAdmin, userEmail }: PostActionsProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Проверяваме дали потребителят може да редактира поста
  const canEdit = isAuthor

  // Проверяваме дали потребителят може да изтрие или архивира поста
  const canDeleteOrArchive = isAuthor || isAdmin || userEmail === "i.goranov02@gmail.com"

  // Ако потребителят няма права за никакви действия, не показваме компонента
  if (!canEdit && !canDeleteOrArchive) {
    return null
  }

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
        description: "Your post has been deleted.",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete post",
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
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_archived: true }),
      })

      if (!response.ok) {
        throw new Error("Failed to archive post")
      }

      toast({
        title: "Post archived",
        description: "Your post has been archived.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error archiving post:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to archive post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsArchiveDialogOpen(false)
    }
  }

  return (
    <>
      <div className="flex space-x-2">
        {canEdit && (
          <Link href={`/post/edit/${postId}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
        )}
        
        {canDeleteOrArchive && (
          <>
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
          </>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove the data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
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
              Archiving will hide this post from the main forum. You can unarchive it later from your profile.
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
