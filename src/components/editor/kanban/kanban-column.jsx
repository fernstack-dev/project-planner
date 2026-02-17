"use client";

import { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { unsafeOverflowAutoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/unsafe-overflow/element";
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { KanbanCard } from "./kanban-card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ColorPicker } from "./color-picker";
import { useBoard } from "./kanban-board";

const isSafari = () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const isInteractive = (element) => {
  if (!element) return false;
  const tagName = element.tagName?.toLowerCase();
  return (
    tagName === "button" ||
    tagName === "input" ||
    tagName === "textarea" ||
    element.closest("button") ||
    element.closest("input") ||
    element.closest("textarea") ||
    element.closest('[role="button"]')
  );
};

export function KanbanColumn({ column }) {
  const {
    onToggleCollapse,
    onUpdateTitle,
    onUpdateColor,
    onAddCard,
    onRemove,
    editingColumnId,
    setEditingColumnId,
    availableColors,
  } = useBoard();

  // UI state
  const [isEditing, setIsEditing] = useState(editingColumnId === column.id);
  const [editValue, setEditValue] = useState(column.title);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCardOver, setIsCardOver] = useState(false);
  const [cardDraggingRect, setCardDraggingRect] = useState(null);
  const [overChildCard, setOverChildCard] = useState(false);
  const [isColumnOver, setIsColumnOver] = useState(false);
  const [columnDropEdge, setColumnDropEdge] = useState(null);

  // Refs
  const headerRef = useRef(null);
  const columnRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const colorPickerRef = useRef(null);

  useEffect(() => {
    const headerEl = headerRef.current;
    const columnEl = columnRef.current;
    const containerEl = containerRef.current;
    if (!headerEl || !columnEl || !containerEl) return;

    return combine(
      draggable({
        element: columnEl,
        canDrag: ({ location }) => {
          if (!location?.current?.input?.target) return true;
          return !isInteractive(location.current.input.target);
        },
        getInitialData: ({ element }) => ({
          type: "column",
          id: column.id,
          title: column.title,
          color: column.color,
          collapsed: column.collapsed,
          rect: element.getBoundingClientRect(),
        }),
        onGenerateDragPreview({ nativeSetDragImage, location, source }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: preserveOffsetOnSource({
              element: columnEl,
              input: location.current.input,
            }),
            render({ container }) {
              const preview = columnEl.cloneNode(true);
              preview.style.width = `${columnEl.offsetWidth}px`;
              preview.style.transform = isSafari() ? "none" : "rotate(4deg)";
              preview.style.opacity = "0.9";
              container.appendChild(preview);
            },
          });
        },
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),

      dropTargetForElements({
        element: columnEl,
        getData: ({ element, input }) => {
          const data = { type: "column", id: column.id };
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["left", "right"],
          });
        },
        canDrop: ({ source }) =>
          source.data.type === "column" && source.data.id !== column.id,
        onDragEnter: ({ self }) => {
          const edge = extractClosestEdge(self.data);
          setIsColumnOver(true);
          setColumnDropEdge(edge);
        },
        onDrag: ({ self }) => {
          const edge = extractClosestEdge(self.data);
          setColumnDropEdge(edge);
        },
        onDragLeave: () => {
          setIsColumnOver(false);
          setColumnDropEdge(null);
        },
        onDrop: () => {
          setIsColumnOver(false);
          setColumnDropEdge(null);
        },
      }),

      dropTargetForElements({
        element: containerEl,
        getData: ({ element, input }) => {
          const data = {
            type: "card-container",
            columnId: column.id,
          };
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["top", "bottom"],
          });
        },
        canDrop: ({ source }) => source.data.type === "card",
        onDragEnter({ source, location }) {
          setIsCardOver(true);
          setCardDraggingRect(
            source.data.rect || containerEl.getBoundingClientRect()
          );
          const childCard = location.current.dropTargets.find(
            (target) =>
              target.data.type === "card" && target.data.columnId === column.id
          );
          setOverChildCard(!!childCard);
        },
        onDrag({ source, location }) {
          setIsCardOver(true);
          setCardDraggingRect(
            source.data.rect || containerEl.getBoundingClientRect()
          );
          const childCard = location.current.dropTargets.find(
            (target) =>
              target.data.type === "card" && target.data.columnId === column.id
          );
          setOverChildCard(!!childCard);
        },
        onDragLeave() {
          setIsCardOver(false);
          setCardDraggingRect(null);
          setOverChildCard(false);
        },
        onDrop() {
          setIsCardOver(false);
          setCardDraggingRect(null);
          setOverChildCard(false);
        },
      }),

      autoScrollForElements({
        element: containerEl,
        canScroll: ({ source }) => source.data.type === "card",
        getConfiguration: () => ({ maxScrollSpeed: 10 }),
      }),
      unsafeOverflowAutoScrollForElements({
        element: containerEl,
        canScroll: ({ source }) => source.data.type === "card",
        getConfiguration: () => ({ maxScrollSpeed: 10 }),
        getOverflow: () => ({
          forTopEdge: { top: 1000 },
          forBottomEdge: { bottom: 1000 },
        }),
      })
    );
  }, [column]);

  useEffect(() => {
    setIsEditing(editingColumnId === column.id);
    if (editingColumnId === column.id) {
      setEditValue(column.title);
      inputRef.current?.focus();
    }
  }, [editingColumnId, column.id, column.title]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showColorPicker &&
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target) &&
        !e.target.closest(".color-picker-trigger")
      ) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== column.title) {
      onUpdateTitle(column.id, editValue);
    }
    setEditingColumnId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    else if (e.key === "Escape") {
      setEditValue(column.title);
      setEditingColumnId(null);
    }
  };

  return (
    <div
      ref={columnRef}
      className={`flex-shrink-0 w-72 transition-opacity relative ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {isColumnOver && columnDropEdge === "left" && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l -ml-0.5" />
      )}
      {isColumnOver && columnDropEdge === "right" && (
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r -mr-0.5" />
      )}

      <div className="bg-gray-900/50 border border-gray-800 rounded-xl backdrop-blur-sm overflow-hidden">
        <div ref={headerRef} className="select-none cursor-grab active:cursor-grabbing">
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="color-picker-trigger w-3 h-3 rounded-full transition-transform hover:scale-125"
                    style={{ backgroundColor: column.color }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                  {showColorPicker && (
                    <div
                      ref={colorPickerRef}
                      className="absolute z-50 top-full left-0 mt-2"
                    >
                      <ColorPicker
                        colors={availableColors}
                        selectedColor={column.color}
                        onSelect={(color) => {
                          onUpdateColor(column.id, color);
                          setShowColorPicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <Input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleSave}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="h-7 bg-gray-800/50 border-gray-700 text-sm"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingColumnId(column.id)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-sm font-semibold hover:bg-gray-800/50 px-2 py-1 rounded transition-colors w-full text-left truncate"
                      style={{ color: column.color }}
                    >
                      {column.title}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleCollapse(column.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-300"
                >
                  {column.collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddCard(column.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-300"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(column.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {!column.collapsed && (
              <div className="text-xs text-gray-400">
                <span>{column.cards.length} tasks</span>
              </div>
            )}
          </div>
        </div>

        {!column.collapsed && (
          <div ref={containerRef} className="p-3 min-h-[200px] flex flex-col">
            {column.cards.map((card) => (
              <div key={card.id} className="mb-2 last:mb-0">
                <KanbanCard card={card} columnId={column.id} />
              </div>
            ))}
            {column.cards.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Drag tasks here or click +
              </div>
            )}

            {isCardOver && !overChildCard && cardDraggingRect && (
              <div
                className="flex-shrink-0 rounded bg-slate-900/50"
                style={{ height: cardDraggingRect.height }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}