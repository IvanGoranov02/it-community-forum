"use server"

import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"
import { generateUsername } from "@/lib/utils"
import { revalidatePath } from "next/cache"

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  try {
    const supabase = createServerClient()
    const username = generateUsername(email)

    // Check if username is already taken
    const { data: existingUser, error: checkError } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle()

    if (checkError) {
      return { error: "Error checking username availability" }
    }

    if (existingUser) {
      return { error: "Username is already taken" }
    }

    // Get the site URL from environment variable or use a fallback
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://it-forum.bg"

    // Create the user with the correct redirect URL
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (authError || !authData.user) {
      console.error("Auth error during registration:", authError)
      return { error: authError?.message || "Failed to create user" }
    }

    // Create the profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
      full_name: name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile error during registration:", profileError)
      return { error: profileError.message }
    }

    // Set the auth cookie
    const { data: sessionData } = await supabase.auth.getSession()

    if (sessionData?.session) {
      const cookieStore = await cookies()
      await cookieStore.set("supabase-auth", JSON.stringify(sessionData.session), {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      })
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error during registration:", error)
    return { error: "An unexpected error occurred during registration" }
  }
}

export async function login(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return { error: "Email and password are required" }
    }

    const supabase = createServerClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      console.error("Login error:", error)
      return { error: error?.message || "Invalid email or password" }
    }

    // Set the auth cookie
    const cookieStore = await cookies()
    await cookieStore.set("supabase-auth", JSON.stringify(data.session), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Unexpected login error:", error)
    return { error: "An unexpected error occurred during login" }
  }
}

export async function logout() {
  try {
    const supabase = createServerClient()
    await supabase.auth.signOut()

    const cookieStore = await cookies()
    await cookieStore.delete("supabase-auth")

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Logout error:", error)
    return { error: "An error occurred during logout" }
  }
}

export async function getUser() {
  try {
    const supabase = createServerClient()
    const cookieStore = await cookies()
    const authCookie = await cookieStore.get("supabase-auth")

    if (!authCookie?.value) {
      return null
    }

    try {
      const session = JSON.parse(authCookie.value)

      if (!session?.access_token) {
        return null
      }

      const {
        data: { user },
      } = await supabase.auth.getUser(session.access_token)

      if (!user) {
        return null
      }

      // Get the user profile
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (!profile) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: profile.full_name || profile.username,
        username: profile.username,
        avatar: profile.avatar_url,
        role: profile.role,
      }
    } catch (parseError) {
      console.error("Error parsing auth cookie:", parseError)
      const cookieStore = await cookies()
      await cookieStore.delete("supabase-auth")
      return null
    }
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}
