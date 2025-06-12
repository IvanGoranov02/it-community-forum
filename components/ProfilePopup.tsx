"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ProfilePopupProps {
  username: string
  children: React.ReactNode
  open?: boolean
  setOpen?: (open: boolean) => void
}

export function ProfilePopup({ username, children, open, setOpen }: ProfilePopupProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const isControlled = open !== undefined && setOpen !== undefined
  const actualOpen = isControlled ? open : internalOpen
  const handleOpenChange = async (isOpen: boolean) => {
    if (isControlled) setOpen?.(isOpen)
    else setInternalOpen(isOpen)
    if (isOpen && !profile && !loading) {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(`/api/profile/${username}`)
        const result = await res.json()
        if (result.success) {
          setProfile(result.profile)
        } else {
          setError(result.error || "Could not load profile.")
        }
      } catch (err) {
        setError("Could not load profile.")
      }
      setLoading(false)
    }
  }

  return (
    <Dialog open={actualOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : profile ? (
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatar_url || `/placeholder.svg?height=80&width=80&query=${profile.full_name}`}/>
              <AvatarFallback>{profile.full_name?.slice(0,2).toUpperCase() || "??"}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <div className="text-xl font-bold">{profile.full_name}</div>
              <div className="text-muted-foreground">@{profile.username}</div>
              <div className="mt-1 text-sm text-muted-foreground">Joined {formatDate(profile.created_at)}</div>
              <div className="mt-2">
                <Badge 
                  variant="outline" 
                  className={
                    profile.role === "admin" || profile.email === "i.goranov02@gmail.com"
                      ? "mr-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      : profile.role === "moderator"
                      ? "mr-2 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      : "mr-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  }
                >
                  {profile.role === "admin" || profile.email === "i.goranov02@gmail.com"
                    ? "Admin"
                    : profile.role === "moderator"
                    ? "Moderator"
                    : "Member"}
                </Badge>
                <span className="text-sm">{profile.reputation} reputation</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-md p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">Bio</div>
              <div>{profile.bio || <span className="text-muted-foreground">No bio</span>}</div>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="bg-muted rounded-md p-2 text-center">
                <div className="text-lg font-bold">{profile.postCount}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="bg-muted rounded-md p-2 text-center">
                <div className="text-lg font-bold">{profile.commentCount}</div>
                <div className="text-xs text-muted-foreground">Comments</div>
              </div>
            </div>
            <Button asChild variant="link" className="mt-2 text-primary">
              <a href={`/profile/${profile.username}`}>View full profile</a>
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
} 