"use client"

import { useEffect, useState } from "react"
import { highlightMentions } from "@/lib/utils"

interface PostContentProps {
  content: string
}

export function PostContent({ content }: PostContentProps) {
  const [formattedContent, setFormattedContent] = useState(content)

  useEffect(() => {
    // Process mentions
    const highlighted = highlightMentions(content)

    // Convert URLs to links
    const withLinks = highlighted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>',
    )

    setFormattedContent(withLinks)
  }, [content])

  return (
    <div
      className="prose dark:prose-invert max-w-none prose-headings:text-primary prose-a:text-primary"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  )
}
