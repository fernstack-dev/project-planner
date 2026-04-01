"use client";

import { useEffect, useRef, useState } from "react";
import {
  draggable,
  dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
  attachClosestEdge,
  extractClosestEdge,
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

export function BoardTabs({
  boards,
  activeBoardId,
  onSelectBoard,
  onAddBoard,
  onRenameBoard,
  onDeleteBoard,
  onReorderBoards,
}) {
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deleteConfirmBoardId, setDeleteConfirmBoardId] = useState(null);
  const tabRefs = useRef({});
  const topbarRef = useRef(null);

  useEffect(() => {
    if (editingBoardId) {
      const input = document.querySelector(`input[data-board-id="${editingBoardId}"]`);
      input?.focus();
    }
  }, [editingBoardId]);

  // Drag and drop with custom preview
  useEffect(() => {
    const cleanupFns = [];

    boards.forEach((board, index) => {
      const tabEl = tabRefs.current[board.id];
      if (!tabEl) return;

      const draggableCleanup = draggable({
        element: tabEl,
        canDrag: ({ location }) => {
          if (!location?.current?.input?.target) return true;
          return !isInteractive(location.current.input.target);
        },
        getInitialData: () => ({
          type: "board-tab",
          id: board.id,
          index,
        }),
        onGenerateDragPreview({ nativeSetDragImage, location, source }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: ({ input }) => {
              if (!input) return { x: 0, y: 0 };
              const topbarRect = topbarRef.current?.getBoundingClientRect();
              if (!topbarRect) return { x: 0, y: 0 };
              return { x: 0, y: topbarRect.top - input.clientY };
            },
            render({ container }) {
              const preview = document.createElement("div");
              preview.textContent = board.name;
              preview.style.padding = "0.5rem 1rem";
              preview.style.background = "rgb(31, 41, 55)";
              preview.style.border = "1px solid rgb(75, 85, 99)";
              preview.style.fontSize = "0.875rem";
              preview.style.fontWeight = "500";
              preview.style.color = "#e5e7eb";
              preview.style.whiteSpace = "nowrap";
              preview.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
              container.appendChild(preview);
            },
          });
        },
        onDragStart: () => {},
        onDrop: () => {},
      });

      const dropTargetCleanup = dropTargetForElements({
        element: tabEl,
        getData: ({ element, input }) => {
          const data = { type: "board-tab", id: board.id, index };
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ["left", "right"],
          });
        },
        canDrop: ({ source }) => source.data.type === "board-tab",
        onDrop: ({ source, self }) => {
          if (source.data.id === board.id) return;
          const edge = extractClosestEdge(self.data);
          if (!edge) return;

          const sourceIndex = source.data.index;
          const targetIndex = index;

          let newIndex = targetIndex;
          if (edge === "right") newIndex = targetIndex + 1;
          if (edge === "left") newIndex = targetIndex;

          if (newIndex === sourceIndex || newIndex === sourceIndex + 1) return;

          const newBoards = [...boards];
          const [moved] = newBoards.splice(sourceIndex, 1);
          newBoards.splice(newIndex, 0, moved);
          onReorderBoards(newBoards);
        },
      });

      cleanupFns.push(draggableCleanup, dropTargetCleanup);
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [boards, onReorderBoards]);

  const handleDoubleClick = (board) => {
    setEditingBoardId(board.id);
    setEditValue(board.name);
  };

  const handleRenameSave = (boardId) => {
    if (editValue.trim() && editValue !== boards.find((b) => b.id === boardId).name) {
      onRenameBoard(boardId, editValue.trim());
    }
    setEditingBoardId(null);
  };

  const handleKeyDown = (e, boardId) => {
    if (e.key === "Enter") handleRenameSave(boardId);
    else if (e.key === "Escape") setEditingBoardId(null);
  };

  const handleDeleteClick = (boardId) => {
    setDeleteConfirmBoardId(boardId);
  };

  const handleDeleteConfirm = (boardId) => {
    if (boards.length > 1) {
      onDeleteBoard(boardId);
    }
    setDeleteConfirmBoardId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmBoardId(null);
  };

  return (
    <div
      ref={topbarRef}
      className="bg-gray-900 border-b border-gray-800 px-4 py-2"
    >
      <div className="flex items-center gap-0 overflow-x-auto pb-1 scrollbar-hide">
        {boards.map((board, idx) => (
          <div
            key={board.id}
            ref={(el) => {
              if (el) tabRefs.current[board.id] = el;
            }}
            onClick={() => onSelectBoard(board.id)}
            onDoubleClick={() => handleDoubleClick(board)}
            className={cn(
              "group flex items-center gap-2 px-4 py-2 select-none cursor-pointer transition-all",
              idx !== boards.length - 1 && "border-r border-gray-800",
              activeBoardId === board.id
                ? "bg-gray-800 text-emerald-300 border-b-2 border-emerald-500"
                : "bg-transparent text-gray-300 hover:bg-gray-800 border-b-2 border-transparent hover:border-gray-700"
            )}
          >
            {editingBoardId === board.id ? (
            <Input
                data-board-id={board.id}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleRenameSave(board.id)}
                onKeyDown={(e) => handleKeyDown(e, board.id)}
                onMouseDown={(e) => e.stopPropagation()}
                className="h-7 w-32 bg-gray-900 border-gray-800 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
            />
            ) : (
            <span className="text-sm font-medium whitespace-nowrap">{board.name}</span>
            )}

            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingBoardId(board.id);
                  setEditValue(board.name);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-gray-200"
              >
                <Pencil className="h-4 w-4" />
              </button>

              {boards.length > 1 && (
                <Popover
                  open={deleteConfirmBoardId === board.id}
                  onOpenChange={(open) => {
                    if (!open) setDeleteConfirmBoardId(null);
                  }}
                >
                  <PopoverTrigger asChild>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(board.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-gray-800 border border-gray-700 text-white p-4">
                    <div className="space-y-3">
                      <p className="text-sm">
                        Удалить доску "{board.name}"?
                      </p>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDeleteCancel}
                          className="text-gray-300 hover:text-gray-100 rounded-none"
                        >
                          Отмена
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteConfirm(board.id)}
                          className="bg-red-600 hover:bg-red-700 rounded-none"
                        >
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>
        ))}

        <Button
          variant="ghost"
          size="sm"
          onClick={onAddBoard}
          className="flex-shrink-0 text-gray-400 hover:text-gray-300 ml-2 h-9 rounded-none"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}