"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Square, CheckSquare, X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function Checklist({ items = [], onAdd, onToggle, onRemove }) {
  const [showInput, setShowInput] = useState(false)
  const [newItemText, setNewItemText] = useState("")

  const handleAdd = () => {
    if (newItemText.trim()) {
      onAdd({
        id: Date.now().toString(),
        text: newItemText,
        checked: false
      })
      setNewItemText("")
      setShowInput(false)
    }
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <div className="space-y-2 border border-gray-800 rounded-lg p-3 bg-gray-900/20">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group">
              <button
                onClick={() => onToggle(item.id)}
                className="focus:outline-none"
              >
                {item.checked ? (
                  <CheckSquare className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
              </button>
              <span
                className={cn(
                  "flex-1 text-sm",
                  item.checked && "line-through text-gray-500"
                )}
              >
                {item.text}
              </span>
              <button
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showInput ? (
        <div className="flex items-center gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Новый пункт"
            className="bg-gray-800 border-gray-700"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
              if (e.key === "Escape") {
                setShowInput(false)
                setNewItemText("")
              }
            }}
            onBlur={() => {
              if (newItemText.trim()) handleAdd()
              else setShowInput(false)
            }}
          />
          <Button size="sm" onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
            Добавить
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInput(true)}
          className="text-gray-400 hover:text-gray-300"
        >
          <Plus className="h-4 w-4 mr-2" />
          Добавить пункт
        </Button>
      )}
    </div>
  )
}