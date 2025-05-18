import Link from "next/link"

export default function DebugNextPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Debug Next.js</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Next.js Information</h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Environment</h3>
            <p>NODE_ENV: {process.env.NODE_ENV}</p>
            <p>NEXT_RUNTIME: {process.env.NEXT_RUNTIME}</p>
          </div>

          <div>
            <h3 className="font-medium">App Router</h3>
            <p>Using Next.js App Router</p>
          </div>

          <div>
            <h3 className="font-medium">Server Components</h3>
            <p>This page is a Server Component</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Debug Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/debug-routes" className="bg-white p-4 rounded shadow text-blue-500 hover:underline">
            Check Routes
          </Link>
          <Link href="/debug-files" className="bg-white p-4 rounded shadow text-blue-500 hover:underline">
            Check Files
          </Link>
          <Link href="/debug-session" className="bg-white p-4 rounded shadow text-blue-500 hover:underline">
            Check Session
          </Link>
          <Link href="/debug-user" className="bg-white p-4 rounded shadow text-blue-500 hover:underline">
            Check User
          </Link>
          <Link href="/debug-supabase" className="bg-white p-4 rounded shadow text-blue-500 hover:underline">
            Check Supabase
          </Link>
          <Link href="/user-edit" className="bg-white p-4 rounded shadow text-blue-500 hover:underline">
            Edit Profile
          </Link>
        </div>
      </div>

      <Link href="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  )
}
