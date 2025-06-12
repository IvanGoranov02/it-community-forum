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
  // Client-side redirect for recovery tokens
  // This will be executed on the client side via a script
  const clientSideRedirectScript = `
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');
      
      if (accessToken && type === 'recovery') {
        // Build the new URL with query parameters
        const queryParams = new URLSearchParams();
        queryParams.set('access_token', accessToken);
        if (refreshToken) queryParams.set('refresh_token', refreshToken);
        queryParams.set('type', type);
        
        // Redirect to reset-password page
        window.location.href = '/reset-password?' + queryParams.toString();
      }
    }
  `;

  const user = await getUser()
  const params = await searchParams
  const redirectUrl = params.redirect ? String(params.redirect) : "/"
  const message = params.message ? String(params.message) : undefined
  const error = params.error ? String(params.error) : undefined

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      {/* Add script to redirect recovery tokens to reset-password page */}
      <script dangerouslySetInnerHTML={{ __html: clientSideRedirectScript }} />
      
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
