import Link from "next/link"
import { Button } from "@/components/ui/button"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

export default function NotFound() {
  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">Page Not Found</h1>
        <p className="mx-auto mt-4 max-w-[500px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-8">
          <Link href="/">
            <Button>Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
