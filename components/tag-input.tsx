"use client"

import { useState, useEffect } from "react"
import { Check, X, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Tag {
  id: string
  name: string
  description?: string
}

interface TagInputProps {
  availableTags: Tag[]
  onChange?: (selectedTags: Tag[]) => void
  defaultSelectedTags?: Tag[]
}

export function TagInput({ availableTags, onChange, defaultSelectedTags = [] }: TagInputProps) {
  const [open, setOpen] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Tag[]>(defaultSelectedTags)

  useEffect(() => {
    // Update hidden input when selected tags change
    const tagsInput = document.getElementById("tags-input") as HTMLInputElement
    if (tagsInput) {
      tagsInput.value = JSON.stringify(selectedTags.map((tag) => tag.id))
    }

    // Call onChange if provided
    if (onChange) {
      onChange(selectedTags)
    }
  }, [selectedTags, onChange])

  const handleSelect = (tag: Tag) => {
    // Check if tag is already selected
    if (!selectedTags.some((t) => t.id === tag.id)) {
      const newSelectedTags = [...selectedTags, tag]
      setSelectedTags(newSelectedTags)
    }
    setOpen(false)
  }

  const handleRemove = (tagId: string) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTags.map((tag) => (
          <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
            {tag.name}
            <button
              type="button"
              onClick={() => handleRemove(tag.id)}
              className="rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {tag.name}</span>
            </button>
          </Badge>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedTags.length > 0 ? `${selectedTags.length} tags selected` : "Select tags..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleSelect(tag)}
                    className="flex items-center"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedTags.some((t) => t.id === tag.id) ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <div>
                      <p>{tag.name}</p>
                      {tag.description && <p className="text-sm text-muted-foreground">{tag.description}</p>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
