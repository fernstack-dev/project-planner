"use client"

import React, { createContext, useContext, useEffect, useRef, useCallback } from "react"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder"
import { KanbanColumn } from "./kanban-column"
import { Plus } from "lucide-react"

const BoardContext = createContext(null)

export const useBoard = () => {
  const context = useContext(BoardContext)
  if (!context) throw new Error("useBoard must be used within KanbanBoard")
  return context
}

export function KanbanBoard({
  columns,
  setColumns,
  onAddColumn,
  onRemoveColumn,
  onToggleCollapse,
  onUpdateColumnTitle,
  onUpdateColumnColor,
  onAddCard,
  onRemoveCard,
  onUpdateCardContent,
  editingColumnId,
  setEditingColumnId,
  editingCardId,
  setEditingCardId,
  availableColors,
}) {
  const scrollableRef = useRef(null)
  const columnsRef = useRef(columns)

  useEffect(() => {
    columnsRef.current = columns
  }, [columns])

  // Auto‑scroll for board
  useEffect(() => {
    const el = scrollableRef.current
    if (!el) return
    const cleanup = autoScrollForElements({
      element: el,
      canScroll: ({ source }) => source.data.type === "card" || source.data.type === "column",
      getConfiguration: () => ({ maxScrollSpeed: 15 }),
    })
    const cleanupUnsafe = unsafeOverflowAutoScrollForElements({
      element: el,
      canScroll: ({ source }) => source.data.type === "card" || source.data.type === "column",
      getConfiguration: () => ({ maxScrollSpeed: 15 }),
      getOverflow: () => ({
        forLeftEdge: { top: 1000, left: 1000, bottom: 1000 },
        forRightEdge: { top: 1000, right: 1000, bottom: 1000 },
      }),
    })
    return () => {
      cleanup()
      cleanupUnsafe()
    }
  }, [])

  // Monitor – handles all drops
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.type === "card" || source.data.type === "column",

      // Inside monitor useEffect
onDrop({ source, location }) {
  const target = location.current.dropTargets[0]
  if (!target) return

  const sourceData = source.data
  const destData = target.data

  // ----- COLUMN REORDER (already working, just ensure edge extraction) -----
  if (sourceData.type === "column" && destData.type === "column") {
    const homeIndex = columnsRef.current.findIndex(col => col.id === sourceData.id)
    const destinationIndex = columnsRef.current.findIndex(col => col.id === destData.id)
    if (homeIndex === -1 || destinationIndex === -1 || homeIndex === destinationIndex) return

    const edge = extractClosestEdge(destData) ?? "right"
    const reordered = reorderWithEdge({
      list: columnsRef.current,
      startIndex: homeIndex,
      indexOfTarget: destinationIndex,
      closestEdgeOfTarget: edge,
      axis: "horizontal",
    })
    setColumns(reordered)
    return
  }

  // ----- CARD DROP -----
  if (sourceData.type === "card") {
    // Find the column that currently contains this card
    const sourceColumn = columnsRef.current.find(col =>
      col.cards.some(c => c.id === sourceData.id)
    )
    if (!sourceColumn) return
    const sourceIndex = sourceColumn.cards.findIndex(c => c.id === sourceData.id)

    // Dropped on a column container (empty space)
    if (destData.type === "card-container") {
      const destColumn = columnsRef.current.find(col => col.id === destData.columnId)
      if (!destColumn) return

      const edge = extractClosestEdge(destData)
      const finalIndex = edge === "top" ? 0 : destColumn.cards.length

      const newSourceCards = [...sourceColumn.cards]
      const [movedCard] = newSourceCards.splice(sourceIndex, 1)

      const newDestCards = [...destColumn.cards]
      newDestCards.splice(finalIndex, 0, movedCard)

      const newColumns = columnsRef.current.map(col => {
        if (col.id === sourceColumn.id) return { ...col, cards: newSourceCards }
        if (col.id === destColumn.id) return { ...col, cards: newDestCards }
        return col
      })
      setColumns(newColumns)
      return
    }

    // Dropped on another card
    if (destData.type === "card") {
      const destColumn = columnsRef.current.find(col =>
        col.cards.some(c => c.id === destData.id)
      )
      if (!destColumn) return

      const destIndex = destColumn.cards.findIndex(c => c.id === destData.id)
      const edge = extractClosestEdge(destData)

      // Same column: use reorderWithEdge (handles edge and index shifts)
      if (sourceColumn.id === destColumn.id) {
        const reordered = reorderWithEdge({
          list: sourceColumn.cards,
          startIndex: sourceIndex,
          indexOfTarget: destIndex,
          closestEdgeOfTarget: edge,
          axis: "vertical",
        })
        const newColumns = columnsRef.current.map(col =>
          col.id === sourceColumn.id ? { ...col, cards: reordered } : col
        )
        setColumns(newColumns)
        return
      }

      // Different columns
      const newSourceCards = [...sourceColumn.cards]
      const [movedCard] = newSourceCards.splice(sourceIndex, 1)

      const newDestCards = [...destColumn.cards]
      const insertAt = edge === "bottom" ? destIndex + 1 : destIndex
      newDestCards.splice(insertAt, 0, movedCard)

      const newColumns = columnsRef.current.map(col => {
        if (col.id === sourceColumn.id) return { ...col, cards: newSourceCards }
        if (col.id === destColumn.id) return { ...col, cards: newDestCards }
        return col
      })
      setColumns(newColumns)
    }
  }
},
    })
  }, [setColumns])

  const contextValue = {
    columns,
    setColumns,
    onAddCard,
    onRemoveCard,
    onUpdateCardContent,
    onToggleCollapse,
    onUpdateColumnTitle,
    onUpdateColumnColor,
    editingColumnId,
    setEditingColumnId,
    editingCardId,
    setEditingCardId,
    availableColors,
  }

  return (
    <BoardContext.Provider value={contextValue}>
      <div
        ref={scrollableRef}
        className="flex h-full flex-row gap-3 overflow-x-auto p-3"
      >
        <button
          onClick={onAddColumn}
          className="flex-shrink-0 w-12 h-12 self-start mt-2 rounded-full bg-gray-900/50 border border-dashed border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
        >
          <Plus className="h-5 w-5 text-gray-400" />
        </button>

        {columns.map((column) => (
          <KanbanColumn key={column.id} column={column} />
        ))}
      </div>
    </BoardContext.Provider>
  )
}