import { RegisterForm } from "@/components/register-form"
import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { redirect?: string; message?: string }
}) {
  const user = await getUser()
  const redirectUrl = searchParams.redirect || "/"

  if (user) {
    redirect(redirectUrl)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <RegisterForm redirectUrl={redirectUrl} />
    </div>
  )
}
