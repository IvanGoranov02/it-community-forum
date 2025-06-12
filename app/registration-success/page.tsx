import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Registration Successful | IT Community Forum",
  description: "Your registration was successful. Please check your email to confirm your account.",
}

export default function RegistrationSuccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const email = typeof searchParams.email === 'string' ? searchParams.email : '';
  
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Registration Successful!</CardTitle>
          <CardDescription>One more step to complete your registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg flex items-start space-x-4">
            <Mail className="h-6 w-6 mt-1 text-primary" />
            <div>
              <h3 className="font-medium">Confirm Your Email</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We've sent a confirmation email to{' '}
                <span className="font-medium">{email || 'your email address'}</span>.
              </p>
              <p className="text-sm mt-2">
                Please check your inbox (and spam folder) and click the confirmation link to activate your account.
              </p>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg flex items-start space-x-4 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-6 w-6 mt-1 text-amber-600 dark:text-amber-400" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Important</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                You will not be able to log in until you confirm your email address.
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-2">
                The confirmation link is valid for 24 hours.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/login">Go to Login Page</Link>
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Didn't receive the email?{' '}
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href={`/resend-confirmation?email=${encodeURIComponent(email)}`}>Resend confirmation email</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 