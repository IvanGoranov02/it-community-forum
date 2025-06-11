import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { TagIcon } from "lucide-react"

interface Tag {
  id: string
  name: string
  slug: string
}

interface PostTagsProps {
  tags: any[]
}

export function PostTags({ tags }: PostTagsProps) {
  if (!tags || tags.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag) => (
        <Link key={tag.id} href={`/tags/${tag.slug}`}>
          <Badge
            variant="outline"
            className="flex items-center gap-1 hover:bg-primary/10 transition-colors border-primary/30"
          >
            <TagIcon className="h-3 w-3 text-primary/70" />
            {tag.name}
          </Badge>
        </Link>
      ))}
    </div>
  )
}
