import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { userId, email } = await request.json()

    if (!userId && !email) {
      return NextResponse.json({ error: "Either userId or email is required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Try to use the admin API to update the user
    try {
      if (userId) {
        // If we have the user ID, update directly
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          email_confirmed: true,
        })

        if (error) {
          console.error("Error confirming email with userId:", error)
          return NextResponse.json(
            {
              error: error.message,
              details: "Admin API failed. Make sure you have the correct permissions.",
              suggestion: "Try creating a regular user through the registration page instead.",
            },
            { status: 500 },
          )
        }
      } else if (email) {
        // If we only have email, try to find the user first
        try {
          const { data: userData, error: listError } = await supabase.auth.admin.listUsers({
            filter: { email: email },
          })

          if (listError) {
            console.error("Error finding user by email:", listError)
            return NextResponse.json(
              {
                error: listError.message,
                details: "Admin API failed when listing users. Make sure you have the correct permissions.",
                suggestion: "Try creating a regular user through the registration page instead.",
              },
              { status: 500 },
            )
          }

          if (!userData?.users?.length) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
          }

          // Update the found user
          const { error: updateError } = await supabase.auth.admin.updateUserById(userData.users[0].id, {
            email_confirmed: true,
          })

          if (updateError) {
            console.error("Error confirming email for found user:", updateError)
            return NextResponse.json(
              {
                error: updateError.message,
                details: "Admin API failed when updating user. Make sure you have the correct permissions.",
                suggestion: "Try creating a regular user through the registration page instead.",
              },
              { status: 500 },
            )
          }
        } catch (listError) {
          console.error("Error accessing admin API:", listError)
          return NextResponse.json(
            {
              error: "Failed to access admin API",
              details: listError instanceof Error ? listError.message : String(listError),
              suggestion: "Try creating a regular user through the registration page instead.",
            },
            { status: 500 },
          )
        }
      }

      return NextResponse.json({
        success: true,
        message: "Email confirmed successfully",
      })
    } catch (error) {
      console.error("Admin API error:", error)
      return NextResponse.json(
        {
          error: "Failed to confirm email. Admin API may not be available.",
          details: error instanceof Error ? error.message : String(error),
          suggestion: "Try creating a regular user through the registration page instead.",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error confirming email:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
