import type { Metadata } from "next"
import { ResendConfirmationForm } from "@/components/resend-confirmation-form"

export const metadata: Metadata = {
  title: "Resend Confirmation Email | IT Community Forum",
  description: "Resend your confirmation email to activate your account.",
}

export default function ResendConfirmationPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const email = typeof searchParams.email === 'string' ? searchParams.email : '';
  
  return (
    <div className="container flex min-h-screen items-center justify-center py-12">
      <ResendConfirmationForm initialEmail={email} />
    </div>
  )
} 