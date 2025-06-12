"use client"

import React, { useState, useEffect, useRef } from 'react'
import HCaptcha from 'react-hcaptcha'

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
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const captchaRef = useRef<HCaptcha>(null)

  useEffect(() => {
    // Check if the script is already loaded
    if (window.hcaptcha) {
      setScriptLoaded(true)
      return
    }

    // Create script element
    const script = document.createElement('script')
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    
    // Add script to document
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return (
    <div className="flex justify-center my-2">
      {scriptLoaded && (
        <HCaptcha
          sitekey={sitekey}
          onVerify={onVerify}
          onExpire={onExpire || (() => onVerify(""))}
          ref={captchaRef}
        />
      )}
    </div>
  )
} 