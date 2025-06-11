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

    // Create a new report first (do this before email to ensure the report is saved)
    const { error: reportError } = await supabase.from("content_reports").insert({
      content_type: contentType,
      content_id: contentId,
      reporter_id: user.id,
      reason,
      details,
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (reportError) {
      console.error("Error reporting content:", reportError);
      return NextResponse.json(
        { error: reportError.message },
        { status: 500 }
      );
    }

    // Return success response immediately
    // We'll handle the email notification in the background
    setTimeout(async () => {
      try {
        // Get content details for the email notification
        let contentAuthor = "Unknown";
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
              const author = comment.author as any;
              contentAuthor = author?.username || "Unknown";
              contentExcerpt = comment.content 
                ? comment.content.substring(0, 200) + (comment.content.length > 200 ? "..." : "") 
                : "";
            }
          }
        } catch (fetchError) {
          console.error("Error fetching content details for report:", fetchError);
          // Continue with basic information even if we can't get content details
        }

        // Get the username from the database
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single();
          
        const username = userProfile?.username || "Unknown User";

        // Send the email notification
        await sendReportNotification({
          contentType,
          contentId,
          reason,
          details,
          reporterUsername: username,
          contentAuthor,
          contentTitle,
          contentExcerpt: contentExcerpt || "No content available",
        });
      } catch (emailError) {
        // Just log the error, we've already returned success to the client
        console.error("Background email notification failed:", emailError);
      }
    }, 0);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in /api/report route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 