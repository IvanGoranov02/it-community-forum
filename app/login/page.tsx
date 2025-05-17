import { LoginForm } from "@/components/login-form"
import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string }
}) {
  const user = await getUser()
  const redirectUrl = searchParams.redirect || "/"

  if (user) {
    redirect(redirectUrl)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <LoginForm redirectUrl={redirectUrl} />
    </div>
  )
}
