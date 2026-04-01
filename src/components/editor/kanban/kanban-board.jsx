"use client"

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react"
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { KanbanColumn } from "./kanban-column"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

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
  onUpdateCardPriority,
  onUpdateCardDueDate,
  onUpdateCardDescription,
  onAddCardLabel,
  onRemoveCardLabel,
  onUpdateCardAssignee,
  onAddCardChecklistItem,
  onToggleChecklistItem,
  onRemoveChecklistItem,
  editingColumnId,
  setEditingColumnId,
  editingCardId,
  setEditingCardId,
  availableColors,
}) {
  const scrollableRef = useRef(null)
  const columnsRef = useRef(columns)
  const [isDraggingScroll, setIsDraggingScroll] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [showLeftFade, setShowLeftFade] = useState(false)
  const [showRightFade, setShowRightFade] = useState(false)

  useEffect(() => {
    columnsRef.current = columns
  }, [columns])

  // Check horizontal overflow for fades
  const checkOverflow = useCallback(() => {
    const el = scrollableRef.current
    if (!el) return
    const hasOverflow = el.scrollWidth > el.clientWidth
    setShowLeftFade(hasOverflow && el.scrollLeft > 0)
    setShowRightFade(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }, [])

  useEffect(() => {
    const el = scrollableRef.current
    if (!el) return
    checkOverflow()
    const handleScroll = () => checkOverflow()
    el.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", checkOverflow)
    return () => {
      el.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkOverflow)
    }
  }, [checkOverflow])

  // Drag-to-scroll horizontally
  const handleMouseDown = (e) => {
    const target = e.target
    if (target.closest("button") || target.closest("input") || target.closest("textarea") || target.closest('[role="button"]')) {
      return
    }
    e.preventDefault()
    const el = scrollableRef.current
    if (!el) return
    setIsDraggingScroll(true)
    setStartX(e.pageX - el.offsetLeft)
    setScrollLeft(el.scrollLeft)
  }

  const handleMouseMove = (e) => {
    if (!isDraggingScroll) return
    e.preventDefault()
    const el = scrollableRef.current
    if (!el) return
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX) * 1.5
    el.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDraggingScroll(false)
  }

  useEffect(() => {
    if (isDraggingScroll) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    } else {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDraggingScroll, handleMouseMove, handleMouseUp])

  // Auto‑scroll for board (unchanged)
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

  // Monitor for drops
useEffect(() => {
  return monitorForElements({
    canMonitor: ({ source }) => source.data.type === "card" || source.data.type === "column",
    onDrop({ source, location }) {
      const target = location.current.dropTargets[0];
      if (!target) return;

      const sourceData = source.data;
      const destData = target.data;

      // Column reordering (already works)
      if (sourceData.type === "column" && destData.type === "column") {
        const homeIndex = columnsRef.current.findIndex(col => col.id === sourceData.id);
        const destinationIndex = columnsRef.current.findIndex(col => col.id === destData.id);
        if (homeIndex === -1 || destinationIndex === -1 || homeIndex === destinationIndex) return;

        const edge = extractClosestEdge(destData) ?? "right";
        const reordered = reorderWithEdge({
          list: columnsRef.current,
          startIndex: homeIndex,
          indexOfTarget: destinationIndex,
          closestEdgeOfTarget: edge,
          axis: "horizontal",
        });
        setColumns(reordered);
        return;
      }

      // Card handling
      if (sourceData.type === "card") {
        const sourceColumn = columnsRef.current.find(col =>
          col.cards.some(c => c.id === sourceData.id)
        );
        if (!sourceColumn) return;
        const sourceIndex = sourceColumn.cards.findIndex(c => c.id === sourceData.id);

        let newColumns;
        let destColumn = null;
        let insertAt = null;
        let newIndex = null;
        let edge = null;

        // Case: Dropped onto column container (between cards)
        if (destData.type === "card-container") {
          destColumn = columnsRef.current.find(col => col.id === destData.columnId);
          if (!destColumn) return;

          edge = extractClosestEdge(destData);
          newIndex = edge === "top" ? 0 : destColumn.cards.length;
          console.log('extracted edge:', edge);
          const finalIndex = edge === "top" ? 0 : destColumn.cards.length;
          console.log('finalIndex:', finalIndex);

          const newSourceCards = [...sourceColumn.cards];
          const [movedCard] = newSourceCards.splice(sourceIndex, 1);
          console.log('movedCard id:', movedCard.id);

          const newDestCards = [...destColumn.cards];
          newDestCards.splice(finalIndex, 0, movedCard);
          console.log('newDestCards after insert:', newDestCards.map(c => c.id));

          newColumns = columnsRef.current.map(col => {
            if (col.id === sourceColumn.id) return { ...col, cards: newSourceCards };
            if (col.id === destColumn.id) return { ...col, cards: newDestCards };
            return col;
          });
          insertAt = finalIndex;
          console.log('Setting columns with new dest cards count:', newColumns.find(col => col.id === destColumn.id).cards.length);

        }

        // Case: Dropped onto another card (reorder or move to different column)
        else if (destData.type === "card") {
          destColumn = columnsRef.current.find(col =>
            col.cards.some(c => c.id === destData.id)
          );
          if (!destColumn) return;

          const destIndex = destColumn.cards.findIndex(c => c.id === destData.id);
          edge = extractClosestEdge(destData);
          newIndex = edge === "bottom" ? destIndex + 1 : destIndex;

          if (sourceColumn.id === destColumn.id) {
            // Same column reorder
            console.log('Same column reorder', { sourceIndex, destIndex, edge });
            const reordered = reorderWithEdge({
              list: sourceColumn.cards,
              startIndex: sourceIndex,
              indexOfTarget: destIndex,
              closestEdgeOfTarget: edge,
              axis: "vertical",
            });
            console.log('Reordered cards:', reordered.map(c => c.id));
            newColumns = columnsRef.current.map(col =>
              col.id === sourceColumn.id ? { ...col, cards: reordered } : col
            );
            insertAt = edge === "bottom" ? destIndex + 1 : destIndex;
            setColumns(newColumns);
          } else {
            // Move to different column, insert at card position
            const newSourceCards = [...sourceColumn.cards];
            const [movedCard] = newSourceCards.splice(sourceIndex, 1);
            console.log('movedCard id:', movedCard.id);

            const newDestCards = [...destColumn.cards];
            insertAt = edge === "bottom" ? destIndex + 1 : destIndex;
            newDestCards.splice(insertAt, 0, movedCard);
            console.log('newDestCards after insert:', newDestCards.map(c => c.id));

            newColumns = columnsRef.current.map(col => {
              if (col.id === sourceColumn.id) return { ...col, cards: newSourceCards };
              if (col.id === destColumn.id) return { ...col, cards: newDestCards };
              return col;
            });

            console.log('Setting columns with new dest cards count:', newColumns.find(col => col.id === destColumn.id).cards.length);

            //setColumns(newColumns);
          }
        }

        if (!destColumn || newIndex === null) return;

        console.log('newIndex:', newIndex, 'sourceIndex:', sourceIndex);

        //if (newIndex <= 0 || newIndex > destColumn.cards.length) return;

        if (sourceColumn.id === destColumn.id && newIndex === sourceIndex) {
          console.log('No‑op reorder, skipping');
          return;
        }

        if (!newColumns) return;

        // Apply local state update
        setColumns(prevColumns => {
          // compute newColumns based on prevColumns
          return newColumns;
        });

        const movedCard = sourceColumn.cards[sourceIndex];
        const movedCardId = movedCard.id;

        // Helper to reorder a column (background)
        const reorderColumn = (columnId, cardIds) => {
          fetch(`/api/columns/${columnId}/cards/reorder`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderedCardIds: cardIds }),
          }).catch(console.error);
        };

        // Update card's columnId and position if moved to another column
        if (sourceColumn.id !== destColumn.id) {
          fetch(`/api/cards/${movedCardId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              columnId: destColumn.id,
              position: insertAt,
            }),
          }).catch(console.error);
        } else {
          // Same column: only position changed, but we'll let reorder handle it
          // (no need to update columnId)
        }

        // Reorder destination column (including the inserted card)
        const updatedDestColumn = newColumns.find(col => col.id === destColumn.id);
        const destOrderedCardIds = updatedDestColumn.cards.map(c => c.id);
        reorderColumn(destColumn.id, destOrderedCardIds);

        // If moved from another column, reorder source column as well (cards shifted)
        if (sourceColumn.id !== destColumn.id) {
          const updatedSourceColumn = newColumns.find(col => col.id === sourceColumn.id);
          const sourceOrderedCardIds = updatedSourceColumn.cards.map(c => c.id);
          reorderColumn(sourceColumn.id, sourceOrderedCardIds);
        }
      }
    },
  });
}, [setColumns]);

  const contextValue = {
    columns,
    setColumns,
    onAddCard,
    onRemoveCard,
    onRemove: onRemoveColumn,
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
    onToggleCollapse,
    onUpdateTitle: onUpdateColumnTitle,
    onUpdateColor: onUpdateColumnColor,
    editingColumnId,
    setEditingColumnId,
    editingCardId,
    setEditingCardId,
    availableColors,
  }

  return (
    <BoardContext.Provider value={contextValue}>
      <div className="relative h-[calc(100vh-200px)]">
        {/* Horizontal gradient overlays */}
        {showLeftFade && (
          <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-r from-gray-950 to-transparent" />
        )}
        {showRightFade && (
          <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-l from-gray-950 to-transparent" />
        )}

        <div
          ref={scrollableRef}
          className={cn(
            "h-full overflow-auto scrollbar-hide",
            isDraggingScroll ? "cursor-grabbing" : "cursor-grab"
          )}
          onMouseDown={handleMouseDown}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <div className="flex flex-row gap-3 p-3 h-full items-start">
            <button
              onClick={onAddColumn}
              className="flex-shrink-0 w-16 h-16 self-start bg-gray-900/50 border border-dashed border-gray-700 hover:border-emerald-500 hover:bg-emerald-500/10 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
            >
              <Plus className="h-5 w-5 text-gray-400" />
            </button>

            {columns.map((column) => {
              if (!column?.id) {
                console.warn('Column missing id:', column);
                return null;
              }
              return <KanbanColumn key={column.id} column={column} />;
            })}
          </div>
        </div>
      </div>
    </BoardContext.Provider>
  )
}