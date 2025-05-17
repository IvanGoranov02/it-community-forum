"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, TagIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Tag {
  id: string
  name: string
  slug: string
}

interface TagInputProps {
  initialTags?: Tag[]
  availableTags: Tag[]
  onChange: (tags: Tag[]) => void
}

export function TagInput({ initialTags = [], availableTags, onChange }: TagInputProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags)
  const [inputValue, setInputValue] = useState("")
  const [filteredTags, setFilteredTags] = useState<Tag[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredTags([])
    } else {
      const filtered = availableTags.filter(
        (tag) =>
          tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedTags.some((selected) => selected.id === tag.id),
      )
      setFilteredTags(filtered)
      setIsDropdownOpen(true)
    }
  }, [inputValue, availableTags, selectedTags])

  const handleAddTag = (tag: Tag) => {
    const newTags = [...selectedTags, tag]
    setSelectedTags(newTags)
    onChange(newTags)
    setInputValue("")
    setIsDropdownOpen(false)
  }

  const handleRemoveTag = (tagId: string) => {
    const newTags = selectedTags.filter((tag) => tag.id !== tagId)
    setSelectedTags(newTags)
    onChange(newTags)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
            <TagIcon className="h-3 w-3" />
            {tag.name}
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => handleRemoveTag(tag.id)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag.name}</span>
            </Button>
          </Badge>
        ))}
      </div>

      <div className="relative">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search tags..."
          className="w-full"
          onFocus={() => inputValue.trim() !== "" && setIsDropdownOpen(true)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
        />

        {isDropdownOpen && filteredTags.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredTags.map((tag) => (
              <div key={tag.id} className="px-4 py-2 hover:bg-muted cursor-pointer" onClick={() => handleAddTag(tag)}>
                <div className="flex items-center gap-1">
                  <TagIcon className="h-3 w-3" />
                  {tag.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
