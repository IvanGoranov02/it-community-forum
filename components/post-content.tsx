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
    setFormattedContent(highlighted)
  }, [content])

  return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formattedContent }} />
}
