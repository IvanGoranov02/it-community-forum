import { AuthError } from "@supabase/supabase-js"

/**
 * Handles authentication errors from Supabase and returns user-friendly error messages
 */
export function handleAuthError(
  error: AuthError | Error | unknown,
  captchaRef?: any,
  setCaptchaToken?: (token: string) => void,
  setErrorMessage?: (msg: string) => void,
  stopLoading?: () => void
): string {
  let errorMessage = "An unexpected error occurred. Please try again"
  
  if (!error) {
    errorMessage = "An unknown error occurred"
  }
  // If it's a standard Error object
  else if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    // Handle common Supabase auth error messages
    if (message.includes("email not confirmed")) {
      errorMessage = "Please confirm your email address before logging in"
    }
    else if (message.includes("invalid login credentials")) {
      errorMessage = "Invalid email or password"
    }
    else if (message.includes("too many requests")) {
      errorMessage = "Too many login attempts. Please try again later"
    }
    else if (message.includes("captcha")) {
      errorMessage = "Captcha verification failed. Please try again"
    }
    else {
      // Return the original message if no specific handling
      errorMessage = error.message
    }
  }
  // If it's an object with an error property (like Supabase response)
  else if (typeof error === "object" && error !== null && "error" in error && typeof (error as any).error === "string") {
    errorMessage = (error as any).error
  }
  
  // If additional callbacks provided, execute them
  if (setErrorMessage) {
    setErrorMessage(errorMessage)
  }
  
  if (stopLoading) {
    stopLoading()
  }
  
  if (captchaRef?.current) {
    captchaRef.current.reset()
  }
  
  if (setCaptchaToken) {
    setCaptchaToken("")
  }
  
  return errorMessage
} 