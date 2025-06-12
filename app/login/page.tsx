import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { getUser } from "@/app/actions/auth"

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

  if (user) {
    redirect(redirectUrl)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <LoginForm redirectUrl={redirectUrl} message={message} error={error} />
    </div>
  )
}
