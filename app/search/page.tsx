import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ForumPost } from "@/components/forum-post"
import { SearchBar } from "@/components/search-bar"
import { ChevronLeft } from "lucide-react"
import { searchPosts } from "@/lib/api"

// Mark this page as dynamic
export const dynamic = "force-dynamic"

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  console.log("Search page loaded with query:", query)

  const results = query ? await searchPosts(query) : []
  console.log(`Rendering ${results.length} search results`)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Forums
        </Link>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
            <p className="text-muted-foreground mt-1">
              {results.length} results for "{query}"
            </p>
          </div>
          <div className="w-full md:w-[300px]">
            <SearchBar className="w-full" />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>Posts matching your search query</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {results.length > 0 ? (
            results.map((post) => (
              <ForumPost
                key={post.id}
                id={post.id}
                title={post.title}
                author={post.author.username}
                authorId={post.author.id}
                category={post.category.name}
                categoryId={post.category.id}
                replies={post.comments?.[0]?.count || 0}
                views={post.views}
                votes={0} // We don't have votes in the search results
                timestamp={post.created_at}
                slug={post.slug}
                isHot={post.views > 100}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {query ? "No posts found matching your search query." : "Enter a search term to find posts."}
              </p>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
