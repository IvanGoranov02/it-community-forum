import { getUser } from "@/app/actions/auth"
import { createServerClient } from "@/lib/supabase"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { TagInput } from "@/components/tag-input"
import { updatePost } from "@/app/actions/posts"

export const dynamic = "force-dynamic"

export default async function EditPostPage({ params }: { params: { id: string } }) {
  try {
    const user = await getUser()

    if (!user) {
      redirect(`/login?redirect=/post/edit/${params.id}`)
    }

    const supabase = createServerClient()

    // Fetch post
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("*, categories(*)")
      .eq("id", params.id)
      .maybeSingle()

    if (postError || !post) {
      console.error("Error fetching post:", postError)
      notFound()
    }

    // Check if user is the author
    if (post.author_id !== user.id) {
      redirect(`/post/${post.slug}`)
    }

    // Fetch categories
    const { data: categories, error: categoriesError } = await supabase.from("categories").select("*").order("name")

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError)
    }

    // Fetch tags
    const { data: tags, error: tagsError } = await supabase.from("tags").select("*").order("name")

    if (tagsError) {
      console.error("Error fetching tags:", tagsError)
    }

    // Fetch post tags
    const { data: postTags, error: postTagsError } = await supabase
      .from("post_tags")
      .select("tags(*)")
      .eq("post_id", post.id)

    if (postTagsError) {
      console.error("Error fetching post tags:", postTagsError)
    }

    const selectedTags = postTags?.map((pt) => pt.tags) || []

    async function handleUpdatePost(formData: FormData) {
      "use server"

      const result = await updatePost(formData)

      if (result.success) {
        redirect(`/post/${result.slug}`)
      }

      return result
    }

    return (
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            href={`/post/${post.slug}`}
            className="flex items-center text-muted-foreground hover:text-foreground mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Post
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
          <p className="text-muted-foreground mt-1">Update your post details</p>
        </div>

        <Card>
          <form action={handleUpdatePost}>
            <input type="hidden" name="postId" value={post.id} />
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>Edit the details of your post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={post.title} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" defaultValue={post.category_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <TagInput availableTags={tags || []} defaultSelectedTags={selectedTags} />
                <input
                  type="hidden"
                  id="tags-input"
                  name="tags"
                  defaultValue={JSON.stringify(selectedTags.map((tag) => tag.id))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea id="content" name="content" defaultValue={post.content} className="min-h-[200px]" required />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/post/${post.slug}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit">Update Post</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error in EditPostPage:", error)
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Edit Post</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-500 mb-4">An error occurred while loading the post: {(error as Error).message}</p>
            <Link href="/my-posts">
              <Button>Return to My Posts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }
}
