"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"

interface EmojiPickerDialogProps {
  choreId: string
  currentEmoji?: string
  onSelect: (emoji: string) => void
}

const EMOJIS = [
  "🧹", "🧽", "🧺", "🗑️", "🚰", "🍳", "🍽️", "🛁", "🚿", "🧴",
  "🧼", "🪥", "🧻", "🪣", "🪠", "🧯", "🔥", "💡", "🔌", "🔧",
  "🔨", "🪛", "🪚", "🪜", "🧰", "🪴", "🌱", "🌿", "🍂", "🍃",
  "♻️", "🗄️", "📦", "📋", "📝", "✅", "❌", "⭐", "💫", "✨"
]

export function EmojiPickerDialog({ choreId, currentEmoji, onSelect }: EmojiPickerDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedEmoji, setSelectedEmoji] = useState(currentEmoji || "")

  useEffect(() => {
    // Load emoji from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`chore-emoji-${choreId}`)
      if (stored) {
        setSelectedEmoji(stored)
      }
    }
  }, [choreId])

  const handleSelect = (emoji: string) => {
    setSelectedEmoji(emoji)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chore-emoji-${choreId}`, emoji)
    }
    onSelect(emoji)
    setOpen(false)
  }

  const handleClear = () => {
    setSelectedEmoji("")
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`chore-emoji-${choreId}`)
    }
    onSelect("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          {selectedEmoji || <Smile className="w-4 h-4 text-charcoal/40" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose an Emoji</DialogTitle>
          <DialogDescription>
            Pick an emoji to personalize this chore (stored in your browser)
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-10 gap-2 py-4">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleSelect(emoji)}
              className={`text-2xl hover:bg-sage/10 rounded p-2 transition-colors ${
                selectedEmoji === emoji ? "bg-sage/20 ring-2 ring-sage" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
        {selectedEmoji && (
          <Button onClick={handleClear} variant="outline" size="sm" className="mt-2">
            Clear Emoji
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
