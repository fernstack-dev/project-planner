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

  const [isEditing, setIsEditing] = useState(editingColumnId === column.id);
  const [editValue, setEditValue] = useState(column.title);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isCardOver, setIsCardOver] = useState(false);
  const [cardDraggingRect, setCardDraggingRect] = useState(null);
  const [overChildCard, setOverChildCard] = useState(false);
  const [isColumnOver, setIsColumnOver] = useState(false);
  const [columnDropEdge, setColumnDropEdge] = useState(null);

  const headerRef = useRef(null);
  const columnRef = useRef(null);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const colorPickerRef = useRef(null);

  // DnD setup
  useEffect(() => {
    const headerEl = headerRef.current;
    const columnEl = columnRef.current;
    const containerEl = containerRef.current;
    if (!headerEl || !columnEl || !containerEl) return;

    return combine(
      draggable({
        element: headerEl,
        getInitialData: ({ element }) => ({
          type: "column",
          id: column.id,
          title: column.title,
          color: column.color,
          collapsed: column.collapsed,
          rect: element.getBoundingClientRect(),
        }),
        onGenerateDragPreview({ nativeSetDragImage, location }) {
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
              preview.style.borderRadius = "0";
              preview.style.backgroundColor = "#1f2937";
              container.appendChild(preview);
            },
          });
        },
        onDragStart: () => setIsDragging(true),
        onDrop: () => setIsDragging(false),
      }),

      // Column drop target – sticky to work even over cards
      dropTargetForElements({
        element: columnEl,
        getIsSticky: () => false,
        getData: ({ element, input }) => {
          const data = { type: "column", id: column.id };
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["left", "right"],
          });
        },
        canDrop: ({ source }) => {
          if (source.data.type === "card") return false;

          return (
            source.data.type === "column" &&
            source.data.id !== column.id
          );
        },
        onDragEnter: ({ self, source }) => {
          if (source.data.type === "card") return;
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

      ...(containerEl
    ? [
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
          canDrop: ({ source }) => {
            if (source.data.type === "column") return false;

            return (
              source.data.type === "card" &&
              source.data.id !== column.id
            );
          },
          onDragEnter({ source, location }) {
            setIsCardOver(true);
            setCardDraggingRect(
              source.data.rect || containerEl.getBoundingClientRect()
            );
            const childCard = location.current.dropTargets.find(
              (target) =>
                target.data.type === "card" &&
                target.data.columnId === column.id
            );
            if (childCard) {
              setOverChildCard(true);
            } else {
              requestAnimationFrame(() => {
                setOverChildCard(false);
              });
            }
          },
          onDrag({ source, location }) {
            setIsCardOver(true);
            setCardDraggingRect(
              source.data.rect || containerEl.getBoundingClientRect()
            );
            const childCard = location.current.dropTargets.find(
              (target) =>
                target.data.type === "card" &&
                target.data.columnId === column.id
            );
            if (childCard) {
              setOverChildCard(true);
            } else {
              requestAnimationFrame(() => {
                setOverChildCard(false);
              });
            }
          },
          onDragLeave() {
            requestAnimationFrame(() => {
              setIsCardOver(false);
              setCardDraggingRect(null);
              setOverChildCard(false);
            });
          },
          onDrop() {
            requestAnimationFrame(() => {
              setIsCardOver(false);
              setCardDraggingRect(null);
              setOverChildCard(false);
            });
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
        }),
      ]
    : [])
    );
  }, [column]);

  // UI editing effects
  useEffect(() => {
  setIsEditing(editingColumnId === column.id);
    if (editingColumnId === column.id) {
      setEditValue(column.title || ''); // ensure string
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
      className={`flex-shrink-0 w-72 min-h-[80px] transition-opacity relative ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      {isColumnOver && columnDropEdge === "left" && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 -ml-0.5" />
      )}
      {isColumnOver && columnDropEdge === "right" && (
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 -mr-0.5" />
      )}

      <div className="bg-gray-900 border border-gray-800 overflow-hidden">
        <div
          ref={headerRef}
          role="button"
          tabIndex={0}
          className="select-none cursor-grab active:cursor-grabbing focus:outline-none"
        >
          <div className="p-3 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="color-picker-trigger w-3 h-3 transition-transform hover:scale-125"
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
                      className="h-7 bg-gray-900 border-gray-800 text-sm"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingColumnId(column.id)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-sm font-semibold hover:bg-gray-800 px-2 py-1 transition-colors w-full text-left truncate"
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
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-300 rounded-none"
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
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-300 rounded-none"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(column.id)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 rounded-none"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              <span>{column.cards.length} tasks</span>
            </div>
          </div>
        </div>

       <div ref={containerRef} className={`p-3 min-h-[200px] flex flex-col ${column.collapsed ? "hidden" : ""}`}>
          {column.cards.map((card) => (
            <div key={card.id} className="mb-2 last:mb-0">
              <KanbanCard card={card} columnId={column.id} />
            </div>
          ))}

          {column.cards.length === 0 && !(isCardOver && !overChildCard) && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Перетащите сюда карточку или нажмите +
            </div>
          )}

          {isCardOver && !overChildCard && cardDraggingRect && column.cards.length === 0 && (
            <div
              className="flex-shrink-0"
              style={{
                height: cardDraggingRect.height,
                backgroundColor: "#162032",
                borderRadius: "2px",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}