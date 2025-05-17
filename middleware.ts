import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
}

export default function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  // You can add custom middleware logic here if needed
  // For now, we'll just pass through all requests

  return NextResponse.next()
}
