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

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  color: string | null
  created_at: string
}

export function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({})
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Грешка",
        description: "Грешка при зареждане на категориите",
        variant: "destructive",
      })
    } else {
      setCategories(data || [])
    }

    setIsLoading(false)
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setCurrentCategory(category)
      setIsEditing(true)
    } else {
      setCurrentCategory({})
      setIsEditing(false)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setCurrentCategory({})
    setIsEditing(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCurrentCategory({ ...currentCategory, [name]: value })

    // Автоматично генериране на slug от името
    if (name === "name") {
      setCurrentCategory({
        ...currentCategory,
        name: value,
        slug: slugify(value),
      })
    }
  }

  const handleSaveCategory = async () => {
    if (!currentCategory.name || !currentCategory.slug) {
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
      // Обновяване на съществуваща категория
      const { error } = await supabase
        .from("categories")
        .update({
          name: currentCategory.name,
          slug: currentCategory.slug,
          description: currentCategory.description || null,
          icon: currentCategory.icon || null,
          color: currentCategory.color || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentCategory.id)

      if (error) {
        console.error("Error updating category:", error)
        toast({
          title: "Грешка",
          description: "Грешка при обновяване на категорията",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Успех",
          description: "Категорията беше обновена успешно",
        })
        fetchCategories()
        handleCloseDialog()
      }
    } else {
      // Създаване на нова категория
      const { error } = await supabase.from("categories").insert({
        name: currentCategory.name,
        slug: currentCategory.slug,
        description: currentCategory.description || null,
        icon: currentCategory.icon || null,
        color: currentCategory.color || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error creating category:", error)
        toast({
          title: "Грешка",
          description: "Грешка при създаване на категорията",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Успех",
          description: "Категорията беше създадена успешно",
        })
        fetchCategories()
        handleCloseDialog()
      }
    }

    setIsSaving(false)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Сигурни ли сте, че искате да изтриете тази категория? Това действие не може да бъде отменено.")) {
      return
    }

    const supabase = createBrowserClient()

    // Проверка дали има постове в тази категория
    const { count, error: countError } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("category_id", categoryId)

    if (countError) {
      console.error("Error checking posts:", countError)
      toast({
        title: "Грешка",
        description: "Грешка при проверка на постовете в категорията",
        variant: "destructive",
      })
      return
    }

    if (count && count > 0) {
      toast({
        title: "Грешка",
        description: `Не можете да изтриете тази категория, защото съдържа ${count} поста`,
        variant: "destructive",
      })
      return
    }

    // Изтриване на категорията
    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Error deleting category:", error)
      toast({
        title: "Грешка",
        description: "Грешка при изтриване на категорията",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Успех",
        description: "Категорията беше изтрита успешно",
      })
      fetchCategories()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Управление на категории</CardTitle>
          <CardDescription>Създаване и редактиране на категории във форума</CardDescription>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Нова категория
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
                <TableHead>Икона</TableHead>
                <TableHead>Цвят</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Зареждане...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Няма намерени категории
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell>{category.icon || "-"}</TableCell>
                    <TableCell>
                      {category.color ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${category.color}`} />
                          <span>{category.color}</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Действия</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Редактирай</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteCategory(category.id)}>
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
            <DialogTitle>{isEditing ? "Редактиране на категория" : "Нова категория"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Редактирайте информацията за категорията" : "Попълнете информацията за новата категория"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Име</Label>
              <Input
                id="name"
                name="name"
                value={currentCategory.name || ""}
                onChange={handleInputChange}
                placeholder="Име на категорията"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={currentCategory.slug || ""}
                onChange={handleInputChange}
                placeholder="slug-na-kategoriyata"
              />
              <p className="text-xs text-muted-foreground">Използва се в URL адреса на категорията</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                name="description"
                value={currentCategory.description || ""}
                onChange={handleInputChange}
                placeholder="Описание на категорията"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Икона</Label>
              <Input
                id="icon"
                name="icon"
                value={currentCategory.icon || ""}
                onChange={handleInputChange}
                placeholder="Code, Network, Shield, Cloud, Brain, GraduationCap"
              />
              <p className="text-xs text-muted-foreground">Име на икона от Lucide React</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Цвят</Label>
              <Input
                id="color"
                name="color"
                value={currentCategory.color || ""}
                onChange={handleInputChange}
                placeholder="bg-blue-100 dark:bg-blue-900"
              />
              <p className="text-xs text-muted-foreground">Tailwind CSS класове за цвят</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Отказ
            </Button>
            <Button onClick={handleSaveCategory} disabled={isSaving}>
              {isSaving ? "Запазване..." : "Запази"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
