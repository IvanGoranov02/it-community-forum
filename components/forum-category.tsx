import Link from "next/link"
import { Code, Network, Shield, Cloud, Brain, GraduationCap, Users, MessageSquare, type LucideIcon } from "lucide-react"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ForumCategoryProps {
  id: string
  title: string
  description: string
  icon: string
  color: string
  slug: string
  topics?: number
  posts?: number
}

export function ForumCategory({
  id,
  title,
  description,
  icon,
  color,
  slug,
  topics = 0,
  posts = 0,
}: ForumCategoryProps) {
  const IconMap: Record<string, LucideIcon> = {
    Code,
    Network,
    Shield,
    Cloud,
    Brain,
    GraduationCap,
  }

  const IconComponent = IconMap[icon] || Code

  return (
    <Link href={`/category/${slug}`}>
      <Card className="transition-all hover:shadow-md">
        <CardHeader className="flex flex-row items-start gap-4">
          <div className={cn("p-2 rounded-md", color)}>
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{topics} topics</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{posts} posts</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
