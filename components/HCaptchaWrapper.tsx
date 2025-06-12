"use client"

import React, { useState, useEffect, useRef } from 'react'
import HCaptcha from 'react-hcaptcha'
import { NoStrictMode } from "@/components/NoStrictMode"

// Add type declaration for window.hcaptcha
declare global {
  interface Window {
    hcaptcha: any;
  }
}

interface HCaptchaWrapperProps {
  sitekey: string
  onVerify: (token: string) => void
  onExpire?: () => void
}

export function HCaptchaWrapper({ sitekey, onVerify, onExpire }: HCaptchaWrapperProps) {
  const [ready, setReady] = useState(false)
  const captchaRef = useRef<HCaptcha>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.hcaptcha && typeof window.hcaptcha.render === 'function') {
      setReady(true)
      return
    }
    // Only add script if not present
    if (!document.querySelector('script[src^="https://js.hcaptcha.com/1/api.js"]')) {
      const script = document.createElement('script')
      script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
    // Poll for hcaptcha.render
    const interval = setInterval(() => {
      if (window.hcaptcha && typeof window.hcaptcha.render === 'function') {
        setReady(true)
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  if (process.env.NODE_ENV === 'development') {
    return <div className="text-center text-muted-foreground">hCaptcha is disabled in development mode</div>;
  }
  return (
    <NoStrictMode>
      <div className="flex justify-center my-2">
        {ready && (
          <HCaptcha
            sitekey={sitekey}
            onVerify={onVerify}
            onExpire={onExpire || (() => onVerify(""))}
            ref={captchaRef}
          />
        )}
      </div>
    </NoStrictMode>
  )
} 