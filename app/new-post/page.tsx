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
import { toast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function NewPostPage() {
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      try {
        const supabase = createBrowserClient()

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name")

        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError)
          toast({
            title: "Error",
            description: "There was a problem loading the categories",
            variant: "destructive",
          })
          setCategories([])
        } else {
          setCategories(categoriesData || [])
        }

        // Fetch tags
        const { data: tagsData, error: tagsError } = await supabase.from("tags").select("*").order("name")

        if (tagsError) {
          console.error("Error fetching tags:", tagsError)
          toast({
            title: "Error",
            description: "There was a problem loading the tags",
            variant: "destructive",
          })
          setTags([])
        } else {
          setTags(tagsData || [])
        }
      } catch (error) {
        console.error("Error in fetchData:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while loading data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
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

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await createPostWithTags(formData)

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.success) {
        toast({
          title: "Success",
          description: "The post was created successfully",
        })
        router.push(`/post/${result.slug}`)
      }
    } catch (error) {
      console.error("Error submitting post:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the post",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
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
          Back to forum
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create a New Post</h1>
        <p className="text-muted-foreground mt-1">Share your thoughts, questions, or ideas with the community</p>
      </div>

      <Card>
        <form action={handleSubmit}>
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
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Creating...
                </>
              ) : (
                "Create Post"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
