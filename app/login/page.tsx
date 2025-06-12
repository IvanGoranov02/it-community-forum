import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { AuthHashHandler } from "@/components/auth-hash-handler"
import { getUser } from "@/app/actions/auth"
import { LoginPageClient } from "@/components/login-page-client"

export const metadata: Metadata = {
  title: "Login | IT Community Forum",
  description: "Login to your account",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const user = await getUser()
  const params = await searchParams
  const redirectUrl = params.redirect ? String(params.redirect) : "/"
  const message = params.message ? String(params.message) : undefined
  const error = params.error ? String(params.error) : undefined

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthHashHandler />
      <LoginPageClient 
        user={user} 
        redirectUrl={redirectUrl} 
        message={message} 
        error={error} 
      />
    </div>
  )
}
