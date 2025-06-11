"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem("cookie-consent")
    if (!hasConsent) {
      // Show the consent banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem("cookie-consent", "all")
    setIsVisible(false)
  }

  const acceptEssential = () => {
    localStorage.setItem("cookie-consent", "essential")
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/80 backdrop-blur-sm">
      <Card className="mx-auto max-w-5xl p-4 md:p-6 border shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">We use cookies</h3>
            <p className="text-sm text-muted-foreground">
              This website uses cookies to improve your experience. We use essential cookies for authentication 
              and functionality, and preference cookies to remember your settings. 
              By clicking "Accept All", you consent to all cookies. Click "Essential Only" to only allow 
              cookies necessary for the website to function.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
            <Button variant="outline" onClick={acceptEssential}>
              Essential Only
            </Button>
            <Button onClick={acceptAll}>
              Accept All
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 