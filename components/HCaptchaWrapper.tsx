"use client"

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react'
import HCaptcha from 'react-hcaptcha'
import { NoStrictMode } from "@/components/NoStrictMode"

// Add type declaration for window.hcaptcha
declare global {
  interface Window {
    hcaptcha: any;
    hCaptchaOnLoad?: () => void;
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
  const [loadError, setLoadError] = useState(false)
  const captchaRef = useRef<HCaptcha>(null)
  const usedTokensRef = useRef<Set<string>>(new Set())
  const [currentToken, setCurrentToken] = useState<string>("")
  const scriptLoadAttempted = useRef(false)

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

  // Safe check for hCaptcha API
  const isHCaptchaReady = useCallback(() => {
    try {
      return window.hcaptcha && typeof window.hcaptcha.render === 'function';
    } catch (e) {
      console.error('Error checking hCaptcha readiness:', e);
      return false;
    }
  }, [])

  // Load hCaptcha script
  const loadHCaptchaScript = useCallback(() => {
    if (scriptLoadAttempted.current) return;
    scriptLoadAttempted.current = true;
    
    try {
      if (!document.querySelector('script[src^="https://js.hcaptcha.com/1/api.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&onload=hCaptchaOnLoad';
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.error('Failed to load hCaptcha script');
          setLoadError(true);
        };
        
        // Define global callback for when hCaptcha loads
        window.hCaptchaOnLoad = () => {
          console.log('hCaptcha script loaded via onload callback');
          setReady(true);
        };
        
        document.head.appendChild(script);
      }
    } catch (e) {
      console.error('Error loading hCaptcha script:', e);
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if hCaptcha is already loaded
    if (isHCaptchaReady()) {
      console.log('hCaptcha already loaded');
      setReady(true);
      return;
    }
    
    // Load the script
    loadHCaptchaScript();
    
    // Poll for hcaptcha.render as a fallback
    const interval = setInterval(() => {
      if (isHCaptchaReady()) {
        console.log('hCaptcha detected via polling');
        setReady(true);
        clearInterval(interval);
      }
    }, 100);
    
    // Clean up
    return () => {
      clearInterval(interval);
      // Clean up global callback
      if (window.hCaptchaOnLoad) {
        delete window.hCaptchaOnLoad;
      }
    };
  }, [isHCaptchaReady, loadHCaptchaScript]);

  if (process.env.NODE_ENV === 'development') {
    return <div className="text-center text-muted-foreground">hCaptcha is disabled in development mode</div>;
  }
  
  if (loadError) {
    return <div className="text-center text-muted-foreground">Failed to load captcha. Please refresh the page.</div>;
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
        {!ready && (
          <div className="text-center text-muted-foreground">Loading captcha...</div>
        )}
      </div>
    </NoStrictMode>
  );
}) 