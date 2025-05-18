"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile } from "@/app/actions/profile"
import { useActionState } from "react"
import Link from "next/link"
import { AvatarUpload } from "@/components/avatar-upload"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

const initialState = { error: "", success: false, username: "" }

interface ProfileEditFormProps {
  user: {
    id: string
    username: string
    name: string
    bio?: string
    avatar?: string
  }
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(updateProfile, initialState)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || "")

  useEffect(() => {
    if (state.success && state.username) {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      router.push(`/profile/${state.username}`)
    }
  }, [state.success, state.username, router])

  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Edit Profile</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-6">
          {state.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{state.error}</div>
          )}

          <AvatarUpload
            userId={user.id}
            initialAvatarUrl={user.avatar}
            username={user.username}
            onAvatarChange={handleAvatarChange}
          />

          <input type="hidden" name="avatarUrl" value={avatarUrl} />

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" defaultValue={user.username} required />
            <p className="text-sm text-muted-foreground">This will be used in your profile URL: /profile/username</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" defaultValue={user.name} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={user.bio || ""}
              placeholder="Tell us about yourself..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href={`/profile/${user.username}`}>
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
