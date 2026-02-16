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

const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

const idleState = { type: "idle" }

export function KanbanCard({ card, columnId }) {
  const { onRemoveCard, onUpdateCardContent, editingCardId, setEditingCardId } = useBoard()

  const [state, setState] = useState(idleState)
  const [isEditing, setIsEditing] = useState(editingCardId === card.id)
  const [editValue, setEditValue] = useState(card.content)

  const outerRef = useRef(null)
  const innerRef = useRef(null)
  const inputRef = useRef(null)

  // ----- DnD setup – re-runs when card or column changes -----
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
        },
        onDrop() {
          setState(idleState)
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

  // ----- Editing UI -----
  useEffect(() => {
    setIsEditing(editingCardId === card.id)
    if (editingCardId === card.id) {
      setEditValue(card.content)
      inputRef.current?.focus()
    }
  }, [editingCardId, card.id, card.content])

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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-500"
      case "medium": return "bg-amber-500"
      case "low": return "bg-emerald-500"
      default: return "bg-gray-500"
    }
  }

  // ----- Styles (mirroring example exactly) -----
  const innerStyles = {
    idle: "hover:outline outline-2 outline-neutral-50 cursor-grab outline-none",
    "is-dragging": "opacity-40",
  };

  const outerStyles = {
    "is-dragging-and-left-self": "hidden",
  }

  // ----- Shadow component -----
  const CardShadow = ({ dragging }) => (
    <div className="flex-shrink-0 rounded bg-slate-900/50" style={{ height: dragging.height }} />
  )

  return (
    <>
      <div
        ref={outerRef}
        className={`flex flex-shrink-0 flex-col px-3 py-1 ${outerStyles[state.type] || ""}`}
      >
        {state.type === "is-over" && state.closestEdge === "top" && (
          <div className="flex flex-shrink-0 flex-col px-3 py-1">
            <div
              className="flex-shrink-0 rounded bg-slate-900/50"
              style={{ height: state.dragging.height }}
            />
          </div>
        )}

        <div
          ref={innerRef}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(card.priority)}`} />
                <span className="text-xs text-gray-400 uppercase">{card.priority}</span>
              </div>
              <button
                onClick={() => onRemoveCard(columnId, card.id)}
                onMouseDown={(e) => e.stopPropagation()}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400"
              >
                ✕
              </button>
            </div>
            <div>
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleSave}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="bg-gray-900/50 border border-gray-700 text-sm rounded px-2 py-1 w-full"
                />
              ) : (
                <button
                  onClick={() => setEditingCardId(card.id)}
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
          <div className="flex flex-shrink-0 flex-col px-3 py-1">
            <div
              className="flex-shrink-0 rounded bg-slate-900/50"
              style={{ height: state.dragging.height }}
            />
          </div>
        )}
      </div>

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