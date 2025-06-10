"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface AvatarUploadProps {
  userId: string
  initialAvatarUrl?: string
  username: string
  onAvatarChange: (url: string) => void
}

export function AvatarUpload({ userId, initialAvatarUrl, username, onAvatarChange }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || "")
  const [isUploading, setIsUploading] = useState(false)
  const [oldAvatarPath, setOldAvatarPath] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const { toast } = useToast()
  
  // Cropping state
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null)
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [imageSource, setImageSource] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Extract the file path from the URL when component mounts
  useEffect(() => {
    if (initialAvatarUrl) {
      // Extract the file path from the URL
      // The URL format is typically like: https://xxx.supabase.co/storage/v1/object/public/avatars/filename.jpg
      const urlParts = initialAvatarUrl.split("/avatars/")
      if (urlParts.length > 1) {
        setOldAvatarPath(urlParts[1].split("?")[0]) // Remove any query parameters
      }
    }
  }, [initialAvatarUrl])

  const deleteOldAvatar = async (filePath: string) => {
    if (!filePath) return

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.storage.from("avatars").remove([filePath])

      if (error) {
        console.error("Error deleting old avatar:", error)
      } else {
        console.log("Old avatar deleted successfully:", filePath)
      }
    } catch (error) {
      console.error("Error in deleteOldAvatar:", error)
    }
  }

  const uploadAvatar = async (file: File) => {
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG, GIF).",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const supabase = createBrowserClient()

      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: publicURL } = supabase.storage.from("avatars").getPublicUrl(filePath)

      if (publicURL) {
        // Delete old avatar if exists
        if (oldAvatarPath) {
          await deleteOldAvatar(oldAvatarPath)
        }

        // Update avatar path for future reference
        setOldAvatarPath(filePath)

        // Update avatar in UI
        setAvatarUrl(publicURL.publicUrl)
        onAvatarChange(publicURL.publicUrl)

        toast({
          title: "Avatar uploaded successfully",
          description: "Your new avatar has been updated.",
        })
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Upload error",
        description: "There was a problem uploading your avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      
      // Create a URL for the image
      const reader = new FileReader()
      reader.onload = () => {
        setImageSource(reader.result as string)
        setIsCropModalOpen(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = async () => {
    // Delete the avatar from storage if it exists
    if (oldAvatarPath) {
      await deleteOldAvatar(oldAvatarPath)
      setOldAvatarPath(null)
    }

    setAvatarUrl("")
    onAvatarChange("")

    toast({
      title: "Avatar removed",
      description: "Your avatar has been removed.",
    })
  }

  const getCroppedImg = async (
    image: HTMLImageElement,
    crop: Crop
  ): Promise<File | null> => {
    if (!crop || !image) return null
    
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = crop.width
    canvas.height = crop.height
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )
    
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob || !selectedFile) {
          resolve(null)
          return
        }
        
        const file = new File([blob], selectedFile.name, {
          type: selectedFile.type,
          lastModified: Date.now(),
        })
        resolve(file)
      }, selectedFile?.type || 'image/jpeg')
    })
  }

  const handleCropComplete = (crop: Crop) => {
    setCompletedCrop(crop)
  }

  const handleSaveCrop = async () => {
    if (!imgRef.current || !completedCrop) return
    
    try {
      const croppedImage = await getCroppedImg(imgRef.current, completedCrop)
      if (croppedImage) {
        setIsCropModalOpen(false)
        uploadAvatar(croppedImage)
      }
    } catch (error) {
      console.error('Error cropping image:', error)
      toast({
        title: "Cropping error",
        description: "There was a problem cropping your image. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24 border">
        <AvatarImage src={avatarUrl || `/placeholder.svg?height=96&width=96&query=${username}`} alt={username} />
        <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload avatar
            </>
          )}
        </Button>

        {avatarUrl && (
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={isUploading}>
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/jpg"
          className="hidden"
          disabled={isUploading}
        />
      </div>

      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Avatar</DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center justify-center p-2">
            {imageSource && (
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={handleCropComplete}
                aspect={1}
                circularCrop
              >
                <img 
                  ref={imgRef} 
                  src={imageSource} 
                  alt="Crop preview" 
                  className="max-h-[300px] object-contain"
                />
              </ReactCrop>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCropModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={handleSaveCrop}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
