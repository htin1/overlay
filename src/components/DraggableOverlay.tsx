"use client";

import { useRef, useState, useEffect } from "react";

interface Props {
  x: number;
  y: number;
  width: number;
  height: number;
  onUpdate: (x: number, y: number, width: number, height: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function DraggableOverlay({ x, y, width, height, onUpdate, containerRef }: Props) {
  const [dragging, setDragging] = useState<"move" | "se" | null>(null);
  const start = useRef({ x: 0, y: 0, w: 0, h: 0, mouseX: 0, mouseY: 0 });

  const onMouseDown = (e: React.MouseEvent, mode: "move" | "se") => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(mode);
    start.current = { x, y, w: width, h: height, mouseX: e.clientX, mouseY: e.clientY };
  };

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const dx = ((e.clientX - start.current.mouseX) / rect.width) * 100;
      const dy = ((e.clientY - start.current.mouseY) / rect.height) * 100;

      if (dragging === "move") {
        const newX = Math.max(0, Math.min(100 - width, start.current.x + dx));
        const newY = Math.max(0, Math.min(100 - height, start.current.y + dy));
        onUpdate(newX, newY, width, height);
      } else {
        const newW = Math.max(10, Math.min(100 - x, start.current.w + dx));
        const newH = Math.max(5, Math.min(100 - y, start.current.h + dy));
        onUpdate(x, y, newW, newH);
      }
    };

    const onMouseUp = () => setDragging(null);

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, x, y, width, height, onUpdate, containerRef]);

  return (
    <div
      className="absolute border-2 border-white/50 rounded-2xl cursor-move pointer-events-auto"
      style={{ left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%` }}
      onMouseDown={(e) => onMouseDown(e, "move")}
    >
      <div
        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full border-2 border-zinc-800 cursor-se-resize pointer-events-auto"
        onMouseDown={(e) => onMouseDown(e, "se")}
      />
    </div>
  );
}
