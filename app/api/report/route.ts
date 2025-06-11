import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getUser } from "@/app/actions/auth";
import { sendReportNotification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // Get request data
    const body = await request.json();
    const { contentType, contentId, reason, details } = body;

    // Validate required fields
    if (!contentType || !contentId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get current user
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to report content" },
        { status: 401 }
      );
    }

    const supabase = createServerClient();

    // Check if the user has already reported this content
    const { data: existingReport } = await supabase
      .from("content_reports")
      .select("id")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("reporter_id", user.id)
      .maybeSingle();

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 400 }
      );
    }

    // Get content details for the email notification
    let contentAuthor = "";
    let contentTitle = "";
    let contentExcerpt = "";

    try {
      if (contentType === "post") {
        const { data: post } = await supabase
          .from("posts")
          .select(`
            title,
            content,
            author:profiles!author_id(username)
          `)
          .eq("id", contentId)
          .single();
        
        if (post) {
          // Use any type to resolve TypeScript errors
          const author = post.author as any;
          contentAuthor = author?.username || "Unknown";
          contentTitle = post.title || "";
          contentExcerpt = post.content 
            ? post.content.substring(0, 200) + (post.content.length > 200 ? "..." : "") 
            : "";
        }
      } else if (contentType === "comment") {
        const { data: comment } = await supabase
          .from("comments")
          .select(`
            content,
            author:profiles!author_id(username)
          `)
          .eq("id", contentId)
          .single();
        
        if (comment) {
          // Use any type to resolve TypeScript errors
          const author = comment.author as any;
          contentAuthor = author?.username || "Unknown";
          contentExcerpt = comment.content 
            ? comment.content.substring(0, 200) + (comment.content.length > 200 ? "..." : "") 
            : "";
        }
      }
    } catch (fetchError) {
      console.error("Error fetching content details for report:", fetchError);
      // Continue with the report even if we can't get content details
    }

    // Create a new report
    const { error } = await supabase.from("content_reports").insert({
      content_type: contentType,
      content_id: contentId,
      reporter_id: user.id,
      reason,
      details,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error reporting content:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Send email notification to admins (but don't wait for it)
    try {
      // Get the username from the database
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
        
      const username = userProfile?.username || "Unknown User";

      // Send the email in the background
      sendReportNotification({
        contentType,
        contentId,
        reason,
        details,
        reporterUsername: username,
        contentAuthor,
        contentTitle,
        contentExcerpt: contentExcerpt || "No content available",
      }).catch(emailError => {
        console.error("Error sending report notification email:", emailError);
      });
    } catch (emailSetupError) {
      console.error("Error setting up email notification:", emailSetupError);
    }

    // Return success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/report route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 