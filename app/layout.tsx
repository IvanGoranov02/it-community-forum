import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/app/context/auth-context"
import { LoadingProvider } from "@/app/context/loading-context"
import { getUser } from "@/app/actions/auth"
import "./globals.css"

// Mark this layout as dynamic
export const dynamic = "force-dynamic"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TechTalk Forum - IT Community",
  description: "A community forum for IT professionals and enthusiasts",
    generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  return (
    <html lang="en">
      <body className={inter.className}>
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
console.log('Welcome to TechTalk!');

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
            <AuthProvider initialUser={user}>{children}</AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
