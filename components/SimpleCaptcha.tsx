"use client"

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'

declare global {
  interface Window {
    hcaptcha: any;
    onHCaptchaLoad?: () => void;
  }
}

interface SimpleCaptchaProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  containerId?: string;
}

export const SimpleCaptcha = forwardRef(function SimpleCaptcha(
  { sitekey, onVerify, onExpire, containerId = "hcaptcha-container" }: SimpleCaptchaProps,
  ref
) {
  const [loaded, setLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const usedTokensRef = useRef<Set<string>>(new Set());

  const reset = () => {
    if (widgetId !== null && window.hcaptcha) {
      try {
        console.log('Resetting captcha widget:', widgetId);
        window.hcaptcha.reset(widgetId);
      } catch (e) {
        console.error('Error resetting hCaptcha:', e);
      }
    }
  };

  const markTokenAsUsed = (token: string) => {
    if (token) {
      console.log(`Marking token as used: ${token.substring(0, 10)}...`);
      usedTokensRef.current.add(token);
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    reset,
    markTokenAsUsed,
  }));

  // Handle verify callback with token deduplication
  const handleVerify = (token: string) => {
    if (usedTokensRef.current.has(token)) {
      console.warn('Token already used, resetting captcha');
      reset();
      return;
    }
    console.log('hCaptcha verified:', token.substring(0, 10) + '...');
    onVerify(token);
  };

  // Load hCaptcha script
  useEffect(() => {
    console.log('SimpleCaptcha useEffect running, initialized:', initialized.current);
    
    if (typeof window === 'undefined' || initialized.current) return;
    initialized.current = true;
    
    // Create a container element with ID if needed
    if (!document.getElementById(containerId)) {
      console.log('Creating container element with ID:', containerId);
      const captchaContainer = document.createElement('div');
      captchaContainer.id = containerId;
      document.body.appendChild(captchaContainer);
    } else {
      console.log('Container already exists:', containerId);
    }

    // Function to initialize hCaptcha
    const initHCaptcha = () => {
      try {
        if (window.hcaptcha && typeof window.hcaptcha.render === 'function') {
          console.log('Rendering hCaptcha in container:', containerId);
          const id = window.hcaptcha.render(containerId, {
            sitekey,
            callback: handleVerify,
            'expired-callback': () => {
              console.log('hCaptcha expired');
              if (onExpire) onExpire();
            }
          });
          console.log('hCaptcha widget initialized with ID:', id);
          setWidgetId(id);
          setLoaded(true);
        } else {
          console.error('hCaptcha not available for rendering');
        }
      } catch (error) {
        console.error('Error initializing hCaptcha:', error);
      }
    };

    // Set up global callback
    window.onHCaptchaLoad = () => {
      console.log('hCaptcha script loaded via global callback');
      setTimeout(initHCaptcha, 100); // Small delay to ensure DOM is ready
    };

    // Load script if not already loaded
    if (!document.querySelector('script[src^="https://js.hcaptcha.com/1/api.js"]')) {
      console.log('Loading hCaptcha script');
      const script = document.createElement('script');
      script.src = 'https://js.hcaptcha.com/1/api.js?onload=onHCaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      script.onerror = (e) => {
        console.error('Error loading hCaptcha script:', e);
      };
      document.head.appendChild(script);
    } else if (window.hcaptcha) {
      // Script already loaded
      console.log('hCaptcha script already loaded, initializing');
      initHCaptcha();
    } else {
      console.warn('hCaptcha script exists but hcaptcha object not available');
    }

    return () => {
      // Clean up on unmount
      if (widgetId !== null && window.hcaptcha) {
        try {
          console.log('Cleaning up hCaptcha widget:', widgetId);
          window.hcaptcha.reset(widgetId);
          window.hcaptcha.remove(widgetId);
        } catch (e) {
          console.error('Error cleaning up hCaptcha:', e);
        }
      }
    };
  }, [containerId, onExpire, onVerify, sitekey]);

  if (process.env.NODE_ENV === 'development') {
    return <div className="text-center text-muted-foreground">hCaptcha is disabled in development mode</div>;
  }

  return (
    <div className="flex justify-center my-2" suppressHydrationWarning={true}>
      <div id={containerId} ref={containerRef} />
      {!loaded && <div className="text-center text-muted-foreground">Loading captcha...</div>}
    </div>
  );
}); 