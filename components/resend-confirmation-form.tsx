"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase"
import Link from "next/link"
import { useLoading } from "@/app/context/loading-context"

interface ResendConfirmationFormProps {
  initialEmail?: string
}

export function ResendConfirmationForm({ initialEmail = "" }: ResendConfirmationFormProps) {
  const [email, setEmail] = useState(initialEmail)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const { startLoading, stopLoading } = useLoading()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setError("")
    startLoading("Sending confirmation email...")

    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error("Error resending confirmation:", error)
        setError(error.message)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        setIsSent(true)
        toast({
          title: "Success",
          description: "Confirmation email has been sent. Please check your inbox.",
        })
      }
    } catch (error) {
      console.error("Unexpected error:", error)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      stopLoading()
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <Mail className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl text-center">Resend Confirmation Email</CardTitle>
        <CardDescription className="text-center">
          Enter your email address to receive a new confirmation link
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-black px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {isSent ? (
            <div className="bg-green-100 border border-green-400 text-black px-4 py-3 rounded">
              <p className="font-medium">Confirmation email sent!</p>
              <p className="text-sm mt-2">
                Please check your inbox (and spam folder) and click the confirmation link to activate your account.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          {!isSent ? (
            <Button type="submit" className="w-full">
              Resend Confirmation Email
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          )}
          
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">
              Return to login
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
} 