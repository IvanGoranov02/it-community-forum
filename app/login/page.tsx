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
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const user = await getUser()
  const redirectUrl = searchParams.redirect ? String(searchParams.redirect) : "/"
  const message = searchParams.message ? String(searchParams.message) : undefined
  const error = searchParams.error ? String(searchParams.error) : undefined

  if (user) {
    redirect(redirectUrl)
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <LoginForm redirectUrl={redirectUrl} message={message} error={error} />
    </div>
  )
}
