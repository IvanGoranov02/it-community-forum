"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ConfirmTestEmailPage() {
  const [email, setEmail] = useState("testuser@gmail.com")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const { toast } = useToast()

  const handleConfirmEmail = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/confirm-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setResult({ error: data.error || "Failed to confirm email" })
        toast({
          title: "Error",
          description: data.error || "Failed to confirm email",
          variant: "destructive",
        })
      } else {
        setResult({
          success: true,
          message: data.message || "Email confirmed successfully",
        })
        toast({
          title: "Success",
          description: "Email confirmed successfully",
        })
      }
    } catch (error) {
      console.error("Error confirming email:", error)
      setResult({
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      })
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Confirm Test Email</CardTitle>
          <CardDescription>Manually confirm email for an existing test user</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter the user's email"
            />
          </div>

          {result && (
            <div
              className={`mt-4 p-4 rounded-md ${
                result.error ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
              }`}
            >
              {result.error ? <p>Error: {result.error}</p> : <p>{result.message}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between gap-4">
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Back to Login
            </Button>
          </Link>
          <Button onClick={handleConfirmEmail} disabled={isLoading} className="w-full">
            {isLoading ? "Confirming..." : "Confirm Email"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
