import { LoginForm } from "@/components/login-form"
import { getUser } from "@/app/actions/auth"
import { redirect } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { redirect?: string; message?: string; error?: string }
}) {
  const user = await getUser()
  const redirectUrl = searchParams.redirect || "/"
  const message = searchParams.message
  const error = searchParams.error

  if (user) {
    redirect(redirectUrl)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {message === "registration-success" && (
        <Alert className="mb-6 max-w-md mx-auto bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-black">Registration successful</AlertTitle>
          <AlertDescription className="text-black">
            Please check your email to confirm your account before logging in.
          </AlertDescription>
        </Alert>
      )}

      {message === "email-confirmed" && (
        <Alert className="mb-6 max-w-md mx-auto bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-black">Email confirmed</AlertTitle>
          <AlertDescription className="text-black">
            Your email has been confirmed. You can now log in to your account.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-6 max-w-md mx-auto bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-black">Error</AlertTitle>
          <AlertDescription className="text-black">
            {error === "auth-callback-error"
              ? "There was an error confirming your email. Please try again."
              : "An error occurred. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      <LoginForm redirectUrl={redirectUrl} />
    </div>
  )
}
