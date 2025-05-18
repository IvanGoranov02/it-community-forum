import Link from "next/link"

export default function DebugRoutesPage() {
  // List of routes to check
  const routes = [
    "/",
    "/login",
    "/register",
    "/profile/username",
    "/user-edit",
    "/debug-user",
    "/my-posts",
    "/bookmarks",
    "/admin",
    "/admin/moderation",
    "/admin/users",
    "/admin/categories",
    "/admin/tags",
    "/admin/settings",
    "/admin/post-settings",
    "/new-post",
    "/post/slug",
    "/post/edit/id",
    "/category/slug",
    "/tags",
    "/tags/slug",
    "/search",
    "/notifications",
    "/settings",
    "/forgot-password",
    "/reset-password",
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Debug Routes</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Routes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <div key={route} className="bg-white p-4 rounded shadow">
              <Link href={route} className="text-blue-500 hover:underline">
                {route}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <Link href="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  )
}
