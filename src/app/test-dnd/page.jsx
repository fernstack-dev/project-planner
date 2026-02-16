"use client";
import { useEffect, useRef } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

export default function TestPage() {
  const dragRef = useRef();
  const dropRef = useRef();

  useEffect(() => {
    const dragEl = dragRef.current;
    const dropEl = dropRef.current;
    if (!dragEl || !dropEl) return;

    const cleanupDraggable = draggable({
      element: dragEl,
      getInitialData: () => ({ type: "test" }),
      onDragStart: () => console.log("TEST drag start"),
      onDrop: () => console.log("TEST drag end"),
    });

    const cleanupDropTarget = dropTargetForElements({
      element: dropEl,
      getData: () => ({ type: "test-drop" }),
      canDrop: ({ source }) => source.data.type === "test",
    });

    const cleanupMonitor = monitorForElements({
      onDragStart: ({ source }) => console.log("MONITOR start", source.data),
      onDragEnd: ({ source, location }) => {
        console.log("MONITOR end", source.data, location.current.dropTargets[0]?.data);
      },
    });

    return () => {
      cleanupDraggable();
      cleanupDropTarget();
      cleanupMonitor();
    };
  }, []);

  return (
    <div className="p-8">
      <div ref={dragRef} className="p-4 bg-blue-500 text-white rounded cursor-grab w-40">
        Drag me
      </div>
      <div ref={dropRef} className="mt-8 p-8 bg-gray-800 border-2 border-dashed rounded h-40">
        Drop here
      </div>
    </div>
  );
}