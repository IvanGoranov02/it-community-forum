"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("access_token");
  const refreshToken = searchParams.get("refresh_token");
  const type = searchParams.get("type");

  useEffect(() => {
    // If we have a valid recovery token, no need to check session or redirect
    if (accessToken && type === "recovery") {
      return;
    }
    
    // Otherwise check if we have a valid session
    const checkSession = async () => {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        toast({
          title: "Error",
          description: "Invalid or expired password reset link. Please try again.",
          variant: "destructive",
        })
        router.push("/forgot-password")
      }
    }
    checkSession()
  }, [router, toast, accessToken, type])

  // Handle Supabase hash fragment for password recovery
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const hash = window.location.hash.substring(1); // remove '#'
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const type = params.get("type");
      
      if (accessToken && type === "recovery") {
        // Get all parameters from the hash
        const refreshToken = params.get("refresh_token");
        
        // Build the new URL with query parameters
        const queryParams = new URLSearchParams();
        queryParams.set("access_token", accessToken);
        if (refreshToken) queryParams.set("refresh_token", refreshToken);
        queryParams.set("type", type);
        
        // Replace the current URL with query parameters instead of hash
        router.replace(`/reset-password?${queryParams.toString()}`);
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createBrowserClient()
      let updateUserOpts = { password }
      const { error } = await supabase.auth.updateUser(updateUserOpts)

      if (error) {
        setError(error.message)
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        // Set session only after password is updated
        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
        }
        setIsSubmitted(true)
        toast({
          title: "Password updated",
          description: "Your password has been successfully updated.",
        })
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Set New Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        {!isSubmitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-md text-green-800">
              <p className="font-medium">Password updated successfully!</p>
              <p className="mt-2">Your password has been updated. You will be redirected to the login page.</p>
            </div>
            <div className="text-center mt-4">
              <Link href="/login">
                <Button variant="outline">Back to Login</Button>
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
