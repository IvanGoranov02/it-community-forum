"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from "lucide-react"

interface DebugInfoProps {
  title?: string
  data: any
}

export function DebugInfo({ title = "Debug Information", data }: DebugInfoProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    // <Card className="mt-4">
    //   <CardHeader className="p-4 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
    //     <div className="flex items-center justify-between">
    //       <CardTitle className="text-sm">{title}</CardTitle>
    //       <Button variant="ghost" size="sm">
    //         {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    //       </Button>
    //     </div>
    //   </CardHeader>
    //   {isOpen && (
    //     <CardContent className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono whitespace-pre-wrap">
    //       {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
    //     </CardContent>
    //   )}
    // </Card>
    <></>
  )
}
