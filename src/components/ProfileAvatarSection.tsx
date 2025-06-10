"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarUpload } from "@/components/avatar-upload"
import { useState } from "react"

interface ProfileAvatarSectionProps {
  avatarUrl: string | null
  username: string
  userId: string
  fullName: string | null
  isOwnProfile: boolean
}

export function ProfileAvatarSection({ avatarUrl, username, userId, fullName, isOwnProfile }: ProfileAvatarSectionProps) {
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl)

  return (
    <div className="flex flex-col items-center justify-center">
      <Avatar className="h-20 w-20">
        <AvatarImage src={currentAvatar || `/placeholder.svg?height=80&width=80&query=${fullName}`} />
        <AvatarFallback>{fullName?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
      </Avatar>
      {isOwnProfile && (
        <div className="mt-2">
          <AvatarUpload
            userId={userId}
            initialAvatarUrl={currentAvatar || undefined}
            username={username}
            onAvatarChange={() => window.location.reload()}
          />
        </div>
      )}
    </div>
  )
} 