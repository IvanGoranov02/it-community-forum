import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getUser } from "@/app/actions/auth";
import { createNotification } from "@/app/actions/notifications";

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
    const { data: existingReport, error: existingReportError } = await supabase
      .from("content_reports")
      .select("id")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("reporter_id", user.id)
      .maybeSingle();

    if (existingReportError) {
      console.error("Error checking existing report:", existingReportError);
      return NextResponse.json(
        { error: "Error checking existing report" },
        { status: 500 }
      );
    }

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this content" },
        { status: 400 }
      );
    }
    
    // Get the username from the database
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
      
    const username = userProfile?.username || "Unknown User";

    // Create a new report
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
      console.error("Error creating report:", reportError);
      return NextResponse.json(
        { error: "Failed to create report", details: reportError.message },
        { status: 500 }
      );
    }

    // Get content details for notification content
    let contentAuthor = "";
    let contentTitle = "";
    
    try {
      if (contentType === "post") {
        const { data: post } = await supabase
          .from("posts")
          .select(`
            title,
            author:profiles!author_id(username)
          `)
          .eq("id", contentId)
          .single();
        
        if (post) {
          contentAuthor = post.author ? post.author.username : "Unknown";
          contentTitle = post.title || "";
        }
      } else if (contentType === "comment") {
        const { data: comment } = await supabase
          .from("comments")
          .select(`
            author:profiles!author_id(username)
          `)
          .eq("id", contentId)
          .single();
        
        if (comment) {
          contentAuthor = comment.author ? comment.author.username : "Unknown";
        }
      }
    } catch (fetchError) {
      console.error("Error fetching content details for report:", fetchError);
    }

    // Get admin users to send notifications to
    const { data: adminUsers } = await supabase
      .from("profiles")
      .select("id")
      .in("role", ["admin", "moderator"]);

    if (adminUsers && adminUsers.length > 0) {
      // Create notification for each admin
      for (const admin of adminUsers) {
        const reportTypeText = contentType === "post" ? "post" : "comment";
        const titleText = contentTitle ? ` "${contentTitle}"` : "";
        
        const notificationContent = `New ${reportTypeText} report: ${username} reported ${contentAuthor}'s ${reportTypeText}${titleText} for ${reason}`;
        
        await createNotification(
          admin.id,
          notificationContent,
          "/admin/moderation",
          "report"
        );
      }
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error in /api/report route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 