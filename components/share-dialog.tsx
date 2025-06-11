"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Share2, Copy, Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  url: string
  title: string
  children?: React.ReactNode
}

export function ShareDialog({ url, title, children }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const shareUrl = typeof window !== "undefined" ? window.location.origin + url : url
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not copy link to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleShare = (platform: string) => {
    let shareLink = ""
    
    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`
        break
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case "email":
        shareLink = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Check out this link: ${shareUrl}`)}`
        break
      default:
        return
    }
    
    window.open(shareLink, "_blank", "noopener,noreferrer")
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" title="Share">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
          <DialogDescription>Share this content with others</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="share-link">Link</Label>
            <div className="flex gap-2">
              <Input id="share-link" value={shareUrl} readOnly className="flex-1" />
              <Button type="button" onClick={handleCopyLink} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Share via</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="flex-1 min-w-[120px]" 
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 min-w-[120px]" 
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 min-w-[120px]" 
                onClick={() => handleShare("linkedin")}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 min-w-[120px]" 
                onClick={() => handleShare("email")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 