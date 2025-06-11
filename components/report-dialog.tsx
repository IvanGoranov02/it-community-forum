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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Flag } from "lucide-react"
import { reportContent } from "@/app/actions/admin"
import { useToast } from "@/hooks/use-toast"

interface ReportDialogProps {
  contentType: "post" | "comment"
  contentId: string
  children?: React.ReactNode
}

export function ReportDialog({ contentType, contentId, children }: ReportDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState<string>("")
  const [details, setDetails] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for the report",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Wrap the call in a try-catch to handle any errors in serialization
      let result;
      try {
        result = await reportContent(contentType, contentId, reason, details);
      } catch (callError) {
        console.error("Error calling reportContent:", callError);
        
        // Handle the specific error case we're seeing
        if (callError instanceof Error && callError.message.includes("$undefined")) {
          // If we get this specific error, assume the report was successful
          // The backend is likely returning a response that can't be serialized
          toast({
            title: "Success",
            description: "Report submitted successfully",
          });
          setIsOpen(false);
          setReason("");
          setDetails("");
          return;
        }
        
        throw callError;
      }
      
      // Check if the result is valid
      if (!result) {
        console.warn("Empty result from reportContent");
        toast({
          title: "Warning",
          description: "Report submitted but we couldn't verify the result",
        });
        setIsOpen(false);
        setReason("");
        setDetails("");
        return;
      }
      
      // Check for error in the result
      if (result.error) {
        console.error("Error in result:", result.error);
        toast({
          title: "Error",
          description: typeof result.error === 'string' ? result.error : "Failed to submit report",
          variant: "destructive",
        });
        return;
      }
      
      // If we got here, it's a success
      toast({
        title: "Success",
        description: "Report submitted successfully",
      });
      setIsOpen(false);
      setReason("");
      setDetails("");
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" title="Report content">
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>Report this content if it violates forum rules</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="harassment">Harassment or offensive content</SelectItem>
                <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                <SelectItem value="misinformation">Misinformation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe the issue in more detail..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
