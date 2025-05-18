"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createBrowserClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { slugify } from "@/lib/utils"
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

interface Tag {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentTag, setCurrentTag] = useState<Partial<Tag>>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    setIsLoading(true)
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("tags").select("*").order("name")

    if (error) {
      console.error("Error fetching tags:", error)
      toast({
        title: "Грешка",
        description: "Грешка при зареждане на таговете",
        variant: "destructive",
      })
    } else {
      setTags(data || [])
    }

    setIsLoading(false)
  }

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setCurrentTag(tag)
      setIsEditing(true)
    } else {
      setCurrentTag({})
      setIsEditing(false)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setCurrentTag({})
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentTag({ ...currentTag, [name]: value })

    // Автоматично генериране на slug от името
    if (name === "name") {
      setCurrentTag({
        ...currentTag,
        name: value,
        slug: slugify(value),
      })
    }
  }

  const handleSaveTag = async () => {
    if (!currentTag.name || !currentTag.slug) {
      toast({
        title: "Грешка",
        description: "Името и slug са задължителни",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    const supabase = createBrowserClient()

    if (isEditing) {
      // Обновяване на съществуващ таг
      const { error } = await supabase
        .from("tags")
        .update({
          name: currentTag.name,
          slug: currentTag.slug,
          description: currentTag.description || null,
        })
        .eq("id", currentTag.id)

      if (error) {
        console.error("Error updating tag:", error)
        toast({
          title: "Грешка",
          description: "Грешка при обновяване на тага",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Успех",
          description: "Тагът беше обновен успешно",
        })
        fetchTags()
        handleCloseDialog()
      }
    } else {
      // Създаване на нов таг
      const { error } = await supabase.from("tags").insert({
        name: currentTag.name,
        slug: currentTag.slug,
        description: currentTag.description || null,
        created_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating tag:", error)
        toast({
          title: "Грешка",
          description: "Грешка при създаване на тага",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Успех",
          description: "Тагът беше създаден успешно",
        })
        fetchTags()
        handleCloseDialog()
      }
    }

    setIsSaving(false)
  }

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете този таг? Това действие не може да бъде отменено.")) {
      return
    }

    const supabase = createBrowserClient()

    // Проверка дали има постове с този таг
    const { count, error: countError } = await supabase
      .from("post_tags")
      .select("*", { count: "exact", head: true })
      .eq("tag_id", tagId)

    if (countError) {
      console.error("Error checking posts:", countError)
      toast({
        title: "Грешка",
        description: "Грешка при проверка на постовете с този таг",
        variant: "destructive",
      })
      return
    }

    if (count && count > 0) {
      toast({
        title: "Грешка",
        description: `Не можете да изтриете този таг, защото се използва в ${count} поста`,
        variant: "destructive",
      })
      return
    }

    // Изтриване на тага
    const { error } = await supabase.from("tags").delete().eq("id", tagId)

    if (error) {
      console.error("Error deleting tag:", error)
      toast({
        title: "Грешка",
        description: "Грешка при изтриване на тага",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успех",
        description: "Тагът беше изтрит успешно",
      })
      fetchTags()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Управление на тагове</CardTitle>
          <CardDescription>Създаване и редактиране на тагове във форума</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Нов таг
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Име</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Зареждане...
                  </TableCell>
                </TableRow>
              ) : tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Няма намерени тагове
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>{tag.slug}</TableCell>
                    <TableCell>{tag.description || "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Действия</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(tag)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Редактирай</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteTag(tag.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Изтрий</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Редактиране на таг" : "Нов таг"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Редактирайте информацията за тага" : "Попълнете информацията за новия таг"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Име</Label>
              <Input
                id="name"
                name="name"
                value={currentTag.name || ""}
                onChange={handleInputChange}
                placeholder="Име на тага"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={currentTag.slug || ""}
                onChange={handleInputChange}
                placeholder="slug-na-taga"
              />
              <p className="text-xs text-muted-foreground">Използва се в URL адреса на тага</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={currentTag.description || ""}
                onChange={handleInputChange}
                placeholder="Описание на тага"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Отказ
            </Button>
            <Button onClick={handleSaveTag} disabled={isSaving}>
              {isSaving ? "Запазване..." : "Запази"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
