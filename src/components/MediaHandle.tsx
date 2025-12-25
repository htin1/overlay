"use client";

import { useState, useEffect } from "react";
import type { ImageOverlayData, VideoOverlayData } from "@/remotion/Composition";

type MediaOverlay = ImageOverlayData | VideoOverlayData;

interface Props {
  overlay: MediaOverlay;
  onUpdate: (data: Partial<MediaOverlay>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function MediaHandle({ overlay, onUpdate, containerRef }: Props) {
  const [drag, setDrag] = useState<"move" | "resize" | null>(null);
  const [start, setStart] = useState({ x: 0, y: 0, mediaX: 0, mediaY: 0, mediaW: 0, mediaH: 0 });

  // Convert overlay % to container pixels, then get media position within overlay
  const getMediaRect = () => {
    const container = containerRef.current;
    if (!container) return { left: 0, top: 0, width: 0, height: 0 };

    const cw = container.offsetWidth;
    const ch = container.offsetHeight;

    // Overlay position in pixels
    const ox = (overlay.x / 100) * cw;
    const oy = (overlay.y / 100) * ch;
    const ow = (overlay.w / 100) * cw;
    const oh = (overlay.h / 100) * ch;

    // Media position within overlay (relative to overlay)
    const mx = (overlay.mediaX / 100) * ow;
    const my = (overlay.mediaY / 100) * oh;
    const mw = (overlay.mediaW / 100) * ow;
    const mh = (overlay.mediaH / 100) * oh;

    return {
      left: ox + mx,
      top: oy + my,
      width: mw,
      height: mh,
    };
  };

  const rect = getMediaRect();

  const beginDrag = (e: React.MouseEvent, mode: "move" | "resize") => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(mode);
    setStart({
      x: e.clientX,
      y: e.clientY,
      mediaX: overlay.mediaX,
      mediaY: overlay.mediaY,
      mediaW: overlay.mediaW,
      mediaH: overlay.mediaH,
    });
  };

  useEffect(() => {
    if (!drag) return;

    const container = containerRef.current;
    if (!container) return;

    const cw = container.offsetWidth;
    const ch = container.offsetHeight;
    const ow = (overlay.w / 100) * cw;
    const oh = (overlay.h / 100) * ch;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;

      // Convert pixel delta to % of overlay size
      const dxPercent = (dx / ow) * 100;
      const dyPercent = (dy / oh) * 100;

      if (drag === "move") {
        const newX = Math.max(0, Math.min(100 - start.mediaW, start.mediaX + dxPercent));
        const newY = Math.max(0, Math.min(100 - start.mediaH, start.mediaY + dyPercent));
        onUpdate({ mediaX: newX, mediaY: newY });
      } else {
        const newW = Math.max(20, Math.min(100 - start.mediaX, start.mediaW + dxPercent));
        const newH = Math.max(20, Math.min(100 - start.mediaY, start.mediaH + dyPercent));
        onUpdate({ mediaW: newW, mediaH: newH });
      }
    };

    const onUp = () => setDrag(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, start, overlay, onUpdate, containerRef]);

  // Only show when glass is enabled and there's media
  if (!overlay.glass || !overlay.src) return null;

  return (
    <div
      className="absolute border-2 border-dashed border-cyan-400/70 pointer-events-auto cursor-move"
      style={{
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      }}
      onMouseDown={(e) => beginDrag(e, "move")}
    >
      {/* Resize handle */}
      <div
        className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-cyan-400 rounded-sm cursor-se-resize"
        onMouseDown={(e) => beginDrag(e, "resize")}
      />
      {/* Label */}
      <div className="absolute -top-5 left-0 text-[10px] text-cyan-400 whitespace-nowrap">
        Media
      </div>
    </div>
  );
}
