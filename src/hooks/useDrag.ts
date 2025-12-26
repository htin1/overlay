"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseDragOptions<T extends string> {
  onDrag: (mode: T, deltaX: number, deltaY: number) => void;
  onDragEnd?: () => void;
}

export function useDrag<T extends string>(options: UseDragOptions<T>) {
  const { onDrag, onDragEnd } = options;
  const [dragging, setDragging] = useState<T | null>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((e: React.MouseEvent, mode: T) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(mode);
    startPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      onDrag(dragging, deltaX, deltaY);
    };

    const onMouseUp = () => {
      setDragging(null);
      onDragEnd?.();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, onDrag, onDragEnd]);

  return { dragging, startDrag };
}
