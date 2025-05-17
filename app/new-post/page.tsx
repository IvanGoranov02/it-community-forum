"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import { TagInput } from "@/components/tag-input"
import { createPostWithTags } from "@/app/actions/posts"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/context/auth-context"

export default function NewPostPage() {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTags, setSelectedTags] = useState([])
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Redirect if not logged in
    if (!user && !isLoading) {
      router.push("/login?redirect=/new-post")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      const supabase = createBrowserClient()

      // Fetch categories
      const { data: categoriesData } = await supabase.from("categories").select("*").order("name")
      setCategories(categoriesData || [])

      // Fetch tags
      const { data: tagsData } = await supabase.from("tags").select("*").order("name")
      setTags(tagsData || [])

      setIsLoading(false)
    }

    fetchData()
  }, [])

  const handleTagChange = (tags) => {
    setSelectedTags(tags)
    // Update hidden input
    const tagsInput = document.getElementById("tags-input") as HTMLInputElement
    if (tagsInput) {
      tagsInput.value = JSON.stringify(tags.map((tag) => tag.id))
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forums
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create New Post</h1>
        <p className="text-muted-foreground mt-1">Share your thoughts, questions, or insights with the community</p>
      </div>

      <Card>
        <form action={createPostWithTags}>
          <CardHeader>
            <CardTitle>Post Details</CardTitle>
            <CardDescription>Fill in the details for your new post</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Enter a descriptive title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <TagInput availableTags={tags} onChange={handleTagChange} />
              <input type="hidden" id="tags-input" name="tags" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your post content here... Use @username to mention users"
                className="min-h-[200px]"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit">Create Post</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
