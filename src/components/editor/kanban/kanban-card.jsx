"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine"
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { useBoard } from "./kanban-board"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, FileText, CheckSquare, Square, X, Plus, User } from "lucide-react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { Checklist } from "./checklist"

const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

const idleState = { type: "idle" }

export function KanbanCard({ card, columnId }) {
  const {
    onRemoveCard,
    onUpdateCardContent,
    onUpdateCardPriority,
    onUpdateCardDueDate,
    onUpdateCardDescription,
    onAddCardLabel,
    onRemoveCardLabel,
    onUpdateCardAssignee,
    onAddCardChecklistItem,
    onToggleChecklistItem,
    onRemoveChecklistItem,
    editingCardId,
    setEditingCardId,
  } = useBoard()

  const [state, setState] = useState(idleState)
  const [isEditing, setIsEditing] = useState(editingCardId === card.id)
  const [editValue, setEditValue] = useState(card.content)
  const [detailOpen, setDetailOpen] = useState(false)
  const [hasDragged, setHasDragged] = useState(false)

  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const inputRef = useRef(null)
  const dragStartedRef = useRef(false)

  useEffect(() => {
    const outer = outerRef.current
    const inner = innerRef.current
    if (!outer || !inner) return

    return combine(
      draggable({
        element: inner,
        getInitialData: ({ element }) => ({
          type: "card",
          id: card.id,
          columnId,
          content: card.content,
          priority: card.priority,
          rect: element.getBoundingClientRect(),
        }),
        onGenerateDragPreview({ nativeSetDragImage, location, source }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({ element: inner, input: location.current.input }),
            render({ container }) {
              setState({
                type: "preview",
                container,
                dragging: inner.getBoundingClientRect(),
              })
            },
          })
        },
        onDragStart() {
          setState({ type: "is-dragging" })
          setHasDragged(true)
          dragStartedRef.current = true
        },
        onDrop() {
          setState(idleState)
          setTimeout(() => {
            setHasDragged(false)
            dragStartedRef.current = false
          }, 0)
        },
      }),
      dropTargetForElements({
        element: outer,
        getIsSticky: () => true,
        canDrop: ({ source }) => source.data.type === "card",
        getData: ({ element, input }) => {
          const data = {
            type: "card",
            id: card.id,
            columnId,
          }
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          })
        },
        onDragEnter({ self, source }) {
          if (!source.data || source.data.type !== "card" || source.data.id === card.id) return
          const closestEdge = extractClosestEdge(self.data)
          if (!closestEdge) return
          setState({
            type: "is-over",
            dragging: source.data.rect || inner.getBoundingClientRect(),
            closestEdge,
          })
        },
        onDrag({ self, source }) {
          if (!source.data || source.data.type !== "card" || source.data.id === card.id) return
          const closestEdge = extractClosestEdge(self.data)
          if (!closestEdge) return
          setState((current) => {
            const proposed = {
              type: "is-over",
              dragging: source.data.rect || inner.getBoundingClientRect(),
              closestEdge,
            }
            if (
              current.type === "is-over" &&
              current.closestEdge === closestEdge &&
              current.dragging === proposed.dragging
            ) {
              return current
            }
            return proposed
          })
        },
        onDragLeave({ source }) {
          if (source.data?.type === "card" && source.data.id === card.id) {
            setState({ type: "is-dragging-and-left-self" })
            return
          }
          setState(idleState)
        },
        onDrop() {
          setState(idleState)
        },
      })
    )
  }, [card, columnId])

  useEffect(() => {
    setIsEditing(editingCardId === card.id)
    if (editingCardId === card.id) {
      setEditValue(card.content)
      inputRef.current?.focus()
    }
  }, [editingCardId, card.id, card.content])

  const handleCardClick = (e) => {
    if (e.defaultPrevented) return
    if (hasDragged || dragStartedRef.current) return
    setDetailOpen(true)
  }

  const handleSave = () => {
    if (editValue.trim() && editValue !== card.content) {
      onUpdateCardContent(columnId, card.id, editValue)
    }
    setEditingCardId(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave()
    else if (e.key === "Escape") {
      setEditValue(card.content)
      setEditingCardId(null)
    }
  }

  const priorityOptions = [
    { value: "none", label: "Нет" },
    { value: "low", label: "Низкий" },
    { value: "medium", label: "Средний" },
    { value: "high", label: "Высокий" },
  ]

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-500"
      case "medium": return "bg-amber-500"
      case "low": return "bg-emerald-500"
      default: return "bg-gray-500"
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "high": return "Высокий"
      case "medium": return "Средний"
      case "low": return "Низкий"
      default: return null
    }
  }

  const innerStyles = {
    idle: "hover:outline outline-2 outline-neutral-50 cursor-grab outline-none",
    "is-dragging": "opacity-40",
  }

  const outerStyles = {
    "is-dragging-and-left-self": "hidden",
  }

  const CardShadow = ({ dragging }) => (
    <div className="flex-shrink-0 rounded bg-slate-900/50" style={{ height: dragging.height }} />
  )

  const hasIndicators = () => {
    return (
      (card.priority && card.priority !== "none") ||
      (card.labels && card.labels.length > 0) ||
      card.dueDate ||
      card.assignee ||
      card.description ||
      (card.checklist && card.checklist.length > 0)
    )
  }

  const completedChecklistItems = card.checklist?.filter(i => i.checked).length || 0
  const totalChecklistItems = card.checklist?.length || 0

  return (
    <>
      <div
        ref={outerRef}
        className={`flex flex-shrink-0 flex-col px-3 py-1 ${outerStyles[state.type] || ""}`}
      >
        {state.type === "is-over" && state.closestEdge === "top" && (
          <CardShadow dragging={state.dragging} />
        )}

        <div
          ref={innerRef}
          onClick={handleCardClick}
          className={`bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3 group hover:border-gray-600 transition-all outline-none ${
            innerStyles[state.type] || ""
          }`}
          style={
            state.type === "preview"
              ? {
                  width: state.dragging.width,
                  height: state.dragging.height,
                  transform: !isSafari() ? "rotate(4deg)" : undefined,
                }
              : undefined
          }
        >
          <div className="flex flex-col gap-2">
            {hasIndicators() && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {card.priority && card.priority !== "none" && (
                    <div className="flex items-center gap-1 text-xs">
                      <div className={`w-2 h-2 rounded-full ${getPriorityColor(card.priority)}`} />
                      <span className="text-gray-400">{getPriorityLabel(card.priority)}</span>
                    </div>
                  )}

                  {card.labels?.map(label => (
                    <TooltipProvider key={label.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="w-2 h-2 rounded-full cursor-help"
                            style={{ backgroundColor: label.color }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{label.text}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}

                  {card.dueDate && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-gray-400 cursor-help">
                            <CalendarIcon className="h-3 w-3" />
                            <span className="text-xs">{format(new Date(card.dueDate), "d MMM")}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Срок: {format(new Date(card.dueDate), "PPP")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {card.assignee && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="h-4 w-4 cursor-help">
                            <AvatarFallback className="text-[8px] bg-gray-700">
                              {card.assignee.substring(0,2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{card.assignee}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {card.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <FileText className="h-3 w-3 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs max-w-xs truncate">{card.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}

                  {totalChecklistItems > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 text-xs text-gray-400 cursor-help">
                            <CheckSquare className="h-3 w-3" />
                            <span>{completedChecklistItems}/{totalChecklistItems}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Чек-лист: {completedChecklistItems} из {totalChecklistItems}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveCard(columnId, card.id)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            )}

            <div>
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-gray-900/50 border border-gray-700 text-sm rounded px-2 py-1 w-full"
                />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingCardId(card.id)
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-sm text-left hover:bg-gray-800/50 px-2 py-1 rounded transition-colors w-full"
                >
                  {card.content}
                </button>
              )}
            </div>
          </div>
        </div>

        {state.type === "is-over" && state.closestEdge === "bottom" && (
          <CardShadow dragging={state.dragging} />
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl p-6">
          <DialogHeader className="mb-4">
            <DialogTitle>Детали задачи</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Название</Label>
              <Input
                id="title"
                value={card.content}
                onChange={(e) => onUpdateCardContent(columnId, card.id, e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Заметки</Label>
              <Textarea
                id="notes"
                value={card.description || ""}
                onChange={(e) => onUpdateCardDescription(columnId, card.id, e.target.value)}
                className="bg-gray-800 border-gray-700 min-h-[100px]"
                placeholder="Добавить заметки..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Приоритет</Label>
                <Select
                  value={card.priority || "none"}
                  onValueChange={(value) => onUpdateCardPriority(columnId, card.id, value)}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {priorityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          {opt.value !== "none" && (
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(opt.value)}`} />
                          )}
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Срок</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-800 border-gray-700",
                        !card.dueDate && "text-gray-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {card.dueDate ? format(new Date(card.dueDate), "PPP") : "Выбрать дату"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700">
                    <Calendar
                      mode="single"
                      selected={card.dueDate ? new Date(card.dueDate) : undefined}
                      onSelect={(date) => onUpdateCardDueDate(columnId, card.id, date?.toISOString() || null)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Метки</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {card.labels?.map(label => (
                  <Badge
                    key={label.id}
                    style={{ backgroundColor: label.color }}
                    className="text-white px-2 py-1 text-xs"
                  >
                    {label.text}
                    <button
                      onClick={() => onRemoveCardLabel(columnId, card.id, label.id)}
                      className="ml-1 hover:text-white/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить метку
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-gray-800 border-gray-700 p-3 w-64">
                  <div className="space-y-3">
                    <Input
                      placeholder="Текст метки"
                      className="bg-gray-900 border-gray-700"
                      id="new-label-text"
                    />
                    <div className="flex flex-wrap gap-2">
                      {["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899"].map(color => (
                        <button
                          key={color}
                          className="w-6 h-6 rounded-full ring-offset-2 ring-offset-gray-900 hover:ring-2 ring-white transition-all"
                          style={{ backgroundColor: color }}
                          onClick={() => {
                            const text = document.getElementById("new-label-text").value
                            if (text.trim()) {
                              onAddCardLabel(columnId, card.id, { id: Date.now().toString(), text, color })
                              document.getElementById("new-label-text").value = ""
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Исполнитель</Label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <Input
                  value={card.assignee || ""}
                  onChange={(e) => onUpdateCardAssignee(columnId, card.id, e.target.value)}
                  placeholder="Не назначен"
                  className="bg-gray-800 border-gray-700 flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Чек-лист</Label>
              <Checklist
                items={card.checklist || []}
                onAdd={(item) => onAddCardChecklistItem(columnId, card.id, item)}
                onToggle={(itemId) => onToggleChecklistItem(columnId, card.id, itemId)}
                onRemove={(itemId) => onRemoveChecklistItem(columnId, card.id, itemId)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {state.type === "preview" &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-lg p-3"
            style={{
              width: state.dragging.width,
              height: state.dragging.height,
              transform: !isSafari() ? "rotate(4deg)" : undefined,
            }}
          >
            <div className="text-sm">{card.content}</div>
          </div>,
          state.container
        )}
    </>
  )
}