import Link from "next/link"

export default function DebugFilesPage() {
  // List of important files to check
  const files = [
    "app/layout.tsx",
    "app/page.tsx",
    "app/user-edit/page.tsx",
    "app/user-edit/loading.tsx",
    "app/debug-user/page.tsx",
    "app/debug-routes/page.tsx",
    "app/debug-files/page.tsx",
    "app/profile/[username]/page.tsx",
    "app/profile/edit/page.tsx",
    "app/my-posts/page.tsx",
    "app/my-posts/loading.tsx",
    "app/post/[slug]/page.tsx",
    "app/post/edit/[id]/page.tsx",
    "app/actions/auth.ts",
    "app/actions/profile.ts",
    "app/actions/posts.ts",
    "components/user-menu.tsx",
    "components/profile-edit-form.tsx",
    "components/avatar-upload.tsx",
    "lib/api.ts",
    "lib/supabase.ts",
    "lib/utils.ts",
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Debug Files</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Important Files</h2>

        <div className="space-y-2">
          {files.map((file) => (
            <div key={file} className="bg-white p-3 rounded shadow">
              <code className="text-sm">{file}</code>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <Link href="/" className="text-blue-500 hover:underline">
          Return to Home
        </Link>
        <Link href="/debug-routes" className="text-blue-500 hover:underline">
          Check Routes
        </Link>
      </div>
    </div>
  )
}
