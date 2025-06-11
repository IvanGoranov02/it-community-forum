import { NextRequest, NextResponse } from "next/server";
import { reportContent } from "@/app/actions/admin";

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

    // Call the reportContent function which handles everything including email
    const result = await reportContent(contentType, contentId, reason, details);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
    
  } catch (error) {
    console.error("Error in /api/report route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 