import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/app/context/auth-context"
import { LoadingProvider } from "@/app/context/loading-context"
import { getUser } from "@/app/actions/auth"
import { AuthHashHandler } from "@/components/auth-hash-handler"
import { CookieConsent } from "@/components/cookie-consent"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import "./globals.css"
import { GlobalLoader } from "../src/components/GlobalLoader"

// Mark this layout as dynamic
export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: {
    default: "IT-Community - The Forum for IT Professionals | Programming & Tech Discussions",
    template: "%s | IT-Community - The Forum for IT Professionals"
  },
  description: "Join IT-Community, the premier forum for IT professionals, developers, and tech enthusiasts. Discuss programming languages, share knowledge, get career advice, and connect with fellow IT professionals worldwide.",
  keywords: [
    "IT community",
    "programming forum",
    "developer community",
    "tech discussions",
    "coding help",
    "software development",
    "programming languages",
    "web development",
    "mobile development",
    "DevOps",
    "cybersecurity",
    "AI machine learning",
    "cloud computing",
    "career advice",
    "tech jobs",
    "code review",
    "programming tutorials",
    "developer tools",
    "open source",
    "tech news"
  ],
  authors: [{ name: "IT-Community Team" }],
  creator: "IT-Community",
  publisher: "IT-Community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL((() => {
    const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return url.startsWith('http') ? url : `https://${url}`;
  })()),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "IT-Community - The Forum for IT Professionals",
    description: "Join thousands of IT professionals in our vibrant community. Share knowledge, get help with technical problems, discuss latest tech trends, and advance your IT career.",
    url: '/',
    siteName: 'IT-Community',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IT-Community - The Forum for IT Professionals',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "IT-Community - The Forum for IT Professionals",
    description: "Join thousands of IT professionals in our vibrant community. Share knowledge, get technical help, and advance your career.",
    images: ['/og-image.png'],
    creator: '@itcommunity',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  category: 'technology',
  generator: 'Next.js',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0070f3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "IT-Community",
              "description": "The Forum for IT Professionals & Tech Enthusiasts",
              "url": (() => {
                const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                return url.startsWith('http') ? url : `https://${url}`;
              })(),
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${(() => {
                    const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                    return url.startsWith('http') ? url : `https://${url}`;
                  })()}/search?q={search_term_string}`
                },
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "IT-Community",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${(() => {
                    const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
                    return url.startsWith('http') ? url : `https://${url}`;
                  })()}/logo.svg`
                }
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <GlobalLoader />
        <div className="terminal-bg" aria-hidden="true">
          <div className="terminal-window">
            <div className="terminal-bar">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <pre className="terminal-code">
{`$ npm run dev
> next dev

Compiling...

[1] Starting development server...
[2] Connecting to database...
[3] Listening on http://localhost:3000

const user = await getUser();
console.log('Welcome to IT-Community!');

function sum(a, b) {
  return a + b;
}

sum(42, 27); // 69
`}
            </pre>
          </div>
        </div>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LoadingProvider>
            <AuthProvider initialUser={user}>
              {/* AuthHashHandler is not included in the layout */}
              {children}
              <CookieConsent />
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
              <Analytics />
              <SpeedInsights />
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
