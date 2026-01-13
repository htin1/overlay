"use client";

import { useRef, useCallback } from "react";
import { useDrag } from "../hooks/useDrag";

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
  onUpdate: (x: number, y: number, width: number, height: number) => void;
  onSelect?: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function DraggableOverlay({
  x,
  y,
  width,
  height,
  selected,
  onUpdate,
  onSelect,
  containerRef,
}: Props) {
  const initial = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const { startDrag } = useDrag<"move" | "resize">({
    onDrag: (mode, deltaX, deltaY) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const dx = (deltaX / rect.width) * 100;
      const dy = (deltaY / rect.height) * 100;

      if (mode === "move") {
        const newX = Math.max(0, Math.min(100 - width, initial.current.x + dx));
        const newY = Math.max(0, Math.min(100 - height, initial.current.y + dy));
        onUpdate(newX, newY, width, height);
      } else {
        const newW = Math.max(10, Math.min(100 - x, initial.current.w + dx));
        const newH = Math.max(5, Math.min(100 - y, initial.current.h + dy));
        onUpdate(x, y, newW, newH);
      }
    },
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, mode: "move" | "resize") => {
      onSelect?.();
      initial.current = { x, y, w: width, h: height };
      startDrag(e, mode);
    },
    [x, y, width, height, onSelect, startDrag]
  );

  return (
    <div
      className={`absolute pointer-events-none border-2 ${
        selected ? "border-blue-500" : "border-transparent hover:border-white/30"
      }`}
      style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%` }}
    >
      {/* Drag handle */}
      <div
        className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full cursor-move pointer-events-auto border-2 ${
          selected ? "bg-blue-500 border-blue-600" : "bg-white border-zinc-800 hover:bg-zinc-200"
        }`}
        onMouseDown={(e) => handleMouseDown(e, "move")}
      />
      {/* Resize handle */}
      {selected && (
        <div
          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full border-2 cursor-se-resize pointer-events-auto bg-blue-500 border-blue-600"
          onMouseDown={(e) => handleMouseDown(e, "resize")}
        />
      )}
    </div>
  );
}
