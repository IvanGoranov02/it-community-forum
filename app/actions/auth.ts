"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { generateUsername } from "@/lib/utils"

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { error: "All fields are required" }
  }

  const supabase = createServerClient()

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", generateUsername(email))
    .maybeSingle()

  if (existingUser) {
    return { error: "User already exists" }
  }

  // Create the user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
      },
    },
  })

  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create user" }
  }

  // Create the profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    username: generateUsername(email),
    full_name: name,
  })

  if (profileError) {
    return { error: profileError.message }
  }

  // Set the auth cookie
  const { data: sessionData } = await supabase.auth.getSession()

  if (sessionData?.session) {
    cookies().set("supabase-auth", JSON.stringify(sessionData.session), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
  }

  redirect("/")
}

export async function login(formData: FormData) {
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
    return { error: error?.message || "Invalid email or password" }
  }

  // Set the auth cookie
  cookies().set("supabase-auth", JSON.stringify(data.session), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  redirect("/")
}

export async function logout() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  cookies().delete("supabase-auth")
  redirect("/")
}

export async function getUser() {
  const supabase = createServerClient()
  const cookieStore = cookies()
  const authCookie = cookieStore.get("supabase-auth")

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
  } catch {
    return null
  }
}
