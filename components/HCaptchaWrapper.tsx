"use client"

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
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

export const HCaptchaWrapper = forwardRef(function HCaptchaWrapper(
  { sitekey, onVerify, onExpire }: HCaptchaWrapperProps,
  ref
) {
  const [ready, setReady] = useState(false)
  const captchaRef = useRef<HCaptcha>(null)
  const usedTokensRef = useRef<Set<string>>(new Set())
  const [currentToken, setCurrentToken] = useState<string>("")

  const resetCaptcha = useCallback(() => {
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
    setCurrentToken("");
  }, [])

  const handleVerify = useCallback((token: string) => {
    if (usedTokensRef.current.has(token)) {
      console.warn('Token already used, resetting captcha');
      resetCaptcha();
      return;
    }
    setCurrentToken(token);
    onVerify(token);
  }, [onVerify, resetCaptcha])

  const markTokenAsUsed = useCallback((token: string) => {
    if (token) {
      usedTokensRef.current.add(token);
    }
  }, [])

  const handleExpire = useCallback(() => {
    console.log('Captcha expired, clearing token');
    setCurrentToken("");
    if (onExpire) onExpire();
  }, [onExpire])

  useImperativeHandle(ref, () => ({
    reset: resetCaptcha,
    markTokenAsUsed,
  }))

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
      <div className="flex justify-center my-2" suppressHydrationWarning={true}>
        {ready && (
          <HCaptcha
            sitekey={sitekey}
            onVerify={handleVerify}
            onExpire={handleExpire}
            ref={captchaRef}
          />
        )}
      </div>
    </NoStrictMode>
  )
}) 