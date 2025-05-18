import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Code, MessageSquare, Users, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForumCategoryProps {
  id: string
  title: string
  description: string
  icon: string
  color: string
  slug: string
  postCount?: number
  userCount?: number
}

export function ForumCategory({
  id,
  title,
  description,
  icon,
  color,
  slug,
  postCount = 0,
  userCount = 0,
}: ForumCategoryProps) {
  // Dynamically render the icon based on the icon name
  const IconComponent = () => {
    switch (icon) {
      case "Code":
        return <Code className="h-5 w-5" />
      case "MessageSquare":
        return <MessageSquare className="h-5 w-5" />
      case "Users":
        return <Users className="h-5 w-5" />
      default:
        return <Code className="h-5 w-5" />
    }
  }

  return (
    <Card className="transition-all hover:shadow-md border-l-4 border-l-primary/70 hover:border-l-primary">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className={cn("p-2 rounded-md", color)}>
          <IconComponent />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-primary/70" />
            <span>{postCount} posts</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-primary/70" />
            <span>{userCount} users</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-muted">
            IT
          </Badge>
          <Badge variant="outline" className="bg-muted">
            Tech
          </Badge>
        </div>
        <Link href={`/category/${slug}`}>
          <Button variant="ghost" size="sm" className="gap-1 hover:text-primary transition-colors">
            Browse
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
