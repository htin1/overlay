"use client";

import { useRef, useCallback } from "react";
import { useDrag } from "../hooks/useDrag";
import type { ImageOverlayData, VideoOverlayData } from "@/overlays/registry";

type MediaOverlayData = ImageOverlayData | VideoOverlayData;

interface Props {
  overlay: MediaOverlayData;
  onUpdate: (data: Partial<MediaOverlayData>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function MediaHandle({ overlay, onUpdate, containerRef }: Props) {
  const initial = useRef({ mediaX: 0, mediaY: 0, mediaW: 0, mediaH: 0 });

  const getMediaRect = () => {
    const container = containerRef.current;
    if (!container) return { left: 0, top: 0, width: 0, height: 0 };

    const cw = container.offsetWidth;
    const ch = container.offsetHeight;
    const ox = (overlay.x / 100) * cw;
    const oy = (overlay.y / 100) * ch;
    const ow = (overlay.w / 100) * cw;
    const oh = (overlay.h / 100) * ch;
    const mx = (overlay.mediaX / 100) * ow;
    const my = (overlay.mediaY / 100) * oh;
    const mw = (overlay.mediaW / 100) * ow;
    const mh = (overlay.mediaH / 100) * oh;

    return { left: ox + mx, top: oy + my, width: mw, height: mh, ow, oh };
  };

  const { startDrag } = useDrag<"move" | "resize">({
    onDrag: (mode, deltaX, deltaY) => {
      const { ow, oh } = getMediaRect();
      if (!ow || !oh) return;

      const dxPercent = (deltaX / ow) * 100;
      const dyPercent = (deltaY / oh) * 100;

      if (mode === "move") {
        const newX = Math.max(0, Math.min(100 - initial.current.mediaW, initial.current.mediaX + dxPercent));
        const newY = Math.max(0, Math.min(100 - initial.current.mediaH, initial.current.mediaY + dyPercent));
        onUpdate({ mediaX: newX, mediaY: newY });
      } else {
        const newW = Math.max(20, Math.min(100 - initial.current.mediaX, initial.current.mediaW + dxPercent));
        const newH = Math.max(20, Math.min(100 - initial.current.mediaY, initial.current.mediaH + dyPercent));
        onUpdate({ mediaW: newW, mediaH: newH });
      }
    },
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, mode: "move" | "resize") => {
      initial.current = {
        mediaX: overlay.mediaX,
        mediaY: overlay.mediaY,
        mediaW: overlay.mediaW,
        mediaH: overlay.mediaH,
      };
      startDrag(e, mode);
    },
    [overlay.mediaX, overlay.mediaY, overlay.mediaW, overlay.mediaH, startDrag]
  );

  if (!overlay.glass || !overlay.src) return null;

  const rect = getMediaRect();

  return (
    <div
      className="absolute border-2 border-dashed border-cyan-400/70 pointer-events-auto cursor-move"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
      onMouseDown={(e) => handleMouseDown(e, "move")}
    >
      <div
        className="absolute -right-1.5 -bottom-1.5 w-3 h-3 bg-cyan-400 rounded-sm cursor-se-resize"
        onMouseDown={(e) => handleMouseDown(e, "resize")}
      />
      <div className="absolute -top-5 left-0 text-[10px] text-cyan-400 whitespace-nowrap">
        Media
      </div>
    </div>
  );
}
