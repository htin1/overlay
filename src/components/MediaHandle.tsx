"use client";

import { useState, useRef, useEffect } from "react";
import type { GlassOverlayData } from "@/remotion/Composition";

interface MediaHandleProps {
  overlay: GlassOverlayData;
  onUpdate: (data: Partial<GlassOverlayData>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function MediaHandle({ overlay, onUpdate, containerRef }: MediaHandleProps) {
  const [mode, setMode] = useState<"move" | "resize" | null>(null);
  const start = useRef({ x: 0, y: 0, w: 0, h: 0, mx: 0, my: 0 });

  const left = overlay.x + (overlay.mediaX / 100) * overlay.w;
  const top = overlay.y + (overlay.mediaY / 100) * overlay.h;
  const width = (overlay.mediaW / 100) * overlay.w;
  const height = (overlay.mediaH / 100) * overlay.h;

  const begin = (e: React.MouseEvent, m: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    setMode(m);
    start.current = { x: overlay.mediaX, y: overlay.mediaY, w: overlay.mediaW, h: overlay.mediaH, mx: e.clientX, my: e.clientY };
  };

  useEffect(() => {
    if (!mode) return;

    const onMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const dx = ((e.clientX - start.current.mx) / rect.width) * 100 / overlay.w * 100;
      const dy = ((e.clientY - start.current.my) / rect.height) * 100 / overlay.h * 100;

      if (mode === "move") {
        onUpdate({
          mediaX: Math.max(0, Math.min(100 - overlay.mediaW, start.current.x + dx)),
          mediaY: Math.max(0, Math.min(100 - overlay.mediaH, start.current.y + dy)),
        });
      } else {
        onUpdate({
          mediaW: Math.max(10, Math.min(100 - overlay.mediaX, start.current.w + dx)),
          mediaH: Math.max(10, Math.min(100 - overlay.mediaY, start.current.h + dy)),
        });
      }
    };

    const onUp = () => setMode(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [mode, overlay, onUpdate, containerRef]);

  return (
    <div
      className="absolute rounded-lg cursor-move pointer-events-auto border-2 border-green-500 bg-green-500/10"
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
      onMouseDown={(e) => begin(e, "move")}
    >
      <div
        className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-green-500 border-2 border-green-600 cursor-se-resize"
        onMouseDown={(e) => begin(e, "resize")}
      />
    </div>
  );
}

