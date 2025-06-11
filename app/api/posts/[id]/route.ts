import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id
    const supabase = createServerClient()

    // Check if user is the author
    const { data: post, error: postCheckError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single()

    if (postCheckError) {
      console.error("Error checking post:", postCheckError)
      return NextResponse.json({ error: postCheckError.message }, { status: 500 })
    }

    // Check if user is authorized to delete this post
    const isAuthor = post.author_id === user.id;
    const isAdmin = user.role === "admin";
    const isSpecialUser = user.email === "i.goranov02@gmail.com";

    if (!isAuthor && !isAdmin && !isSpecialUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete post
    const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

    if (deleteError) {
      console.error("Error deleting post:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/posts/[id]:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const postId = params.id
    const supabase = createServerClient()
    const body = await request.json()

    // Check if user is the author
    const { data: post, error: postCheckError } = await supabase
      .from("posts")
      .select("author_id")
      .eq("id", postId)
      .single()

    if (postCheckError) {
      console.error("Error checking post:", postCheckError)
      return NextResponse.json({ error: postCheckError.message }, { status: 500 })
    }

    if (post.author_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update post
    const { error: updateError } = await supabase.from("posts").update(body).eq("id", postId)

    if (updateError) {
      console.error("Error updating post:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PATCH /api/posts/[id]:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
