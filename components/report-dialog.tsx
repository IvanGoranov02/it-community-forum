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
        title: "Грешка",
        description: "Моля, изберете причина за доклада",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    const result = await reportContent(contentType, contentId, reason, details)
    setIsSubmitting(false)

    if (result.error) {
      toast({
        title: "Грешка",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успех",
        description: "Докладът беше изпратен успешно",
      })
      setIsOpen(false)
      setReason("")
      setDetails("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" title="Докладвай съдържание">
            <Flag className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Докладване на съдържание</DialogTitle>
          <DialogDescription>Докладвайте това съдържание, ако нарушава правилата на форума</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Причина</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Изберете причина" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spam">Спам</SelectItem>
                <SelectItem value="harassment">Тормоз или обидно съдържание</SelectItem>
                <SelectItem value="inappropriate">Неподходящо съдържание</SelectItem>
                <SelectItem value="misinformation">Дезинформация</SelectItem>
                <SelectItem value="other">Друго</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Допълнителни детайли (по желание)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Опишете проблема по-подробно..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Отказ
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Изпращане..." : "Изпрати доклад"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
