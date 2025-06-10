import { createServerClient } from "@/lib/supabase"
import { getUser } from "@/app/actions/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    if (post.author_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Unarchive post
    const { error: unarchiveError } = await supabase.from("posts").update({ is_archived: false }).eq("id", postId)

    if (unarchiveError) {
      console.error("Error unarchiving post:", unarchiveError)
      return NextResponse.json({ error: unarchiveError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in PATCH /api/posts/[id]/unarchive:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
