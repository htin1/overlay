"use client";

import { useRef, useState, useEffect, memo } from "react";
import { PlayerRef } from "@remotion/player";
import type { Overlay, TextOverlayData } from "@/remotion/Composition";
import { usePlayerFrame } from "../hooks/usePlayerFrame";
import { ZoomIn, ZoomOut } from "lucide-react";

// Shared constants
const BASE_PIXELS_PER_FRAME = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const MIN_CLIP_DURATION = 10;
const TRACK_LABEL_WIDTH = 96;

const OVERLAY_COLORS = {
  glass: { bg: "bg-purple-500", clip: "bg-purple-500/40 border-purple-500/60 hover:bg-purple-500/50" },
  text: { bg: "bg-amber-500", clip: "bg-amber-500/40 border-amber-500/60 hover:bg-amber-500/50" },
} as const;

// Utility: convert click position to frame
function clickToFrame(e: React.MouseEvent, pixelsPerFrame: number, totalFrames: number): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  return Math.max(0, Math.min(totalFrames - 1, Math.round(x / pixelsPerFrame)));
}

// Utility: format seconds to M:SS
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TimelineProps {
  overlays: Overlay[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdateTiming: (id: string, startFrame: number, endFrame: number) => void;
  playerRef: React.RefObject<PlayerRef | null>;
  totalFrames: number;
  fps: number;
}

export function Timeline({
  overlays,
  selectedId,
  onSelect,
  onUpdateTiming,
  playerRef,
  totalFrames,
  fps,
}: TimelineProps) {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pixelsPerFrame = BASE_PIXELS_PER_FRAME * zoom;
  const timelineWidth = totalFrames * pixelsPerFrame;
  const seek = (frame: number) => playerRef.current?.seekTo(frame);

  return (
    <div className="flex flex-col bg-zinc-900/80 border-t border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-zinc-900/50">
        <span className="text-xs text-white/50">Timeline</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z / 1.5))}
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-white/40 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z * 1.5))}
            className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable area */}
      <div ref={scrollRef} className="overflow-auto" style={{ minHeight: 150, maxHeight: 300 }}>
        <div className="relative" style={{ width: timelineWidth + TRACK_LABEL_WIDTH }}>
          {/* Ruler */}
          <div className="flex sticky top-0 z-10">
            <div className="w-24 shrink-0 h-8 border-r border-white/10 bg-zinc-900" />
            <Ruler
              totalFrames={totalFrames}
              fps={fps}
              pixelsPerFrame={pixelsPerFrame}
              onSeek={seek}
            />
          </div>

          {/* Tracks */}
          <div className="relative">
            {overlays.length === 0 ? (
              <div className="flex items-center justify-center h-28 text-white/30 text-sm">
                Add an overlay to see it here
              </div>
            ) : (
              overlays.map((overlay) => (
                <Track
                  key={overlay.id}
                  overlay={overlay}
                  totalFrames={totalFrames}
                  pixelsPerFrame={pixelsPerFrame}
                  selected={selectedId === overlay.id}
                  onSelect={() => onSelect(overlay.id)}
                  onUpdateTiming={(s, e) => onUpdateTiming(overlay.id, s, e)}
                  onSeek={seek}
                />
              ))
            )}

            {/* Playhead */}
            <div
              className="absolute top-0 h-full pointer-events-none"
              style={{ left: TRACK_LABEL_WIDTH, width: timelineWidth }}
            >
              <Playhead playerRef={playerRef} pixelsPerFrame={pixelsPerFrame} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

const Ruler = memo(function Ruler({
  totalFrames,
  fps,
  pixelsPerFrame,
  onSeek,
}: {
  totalFrames: number;
  fps: number;
  pixelsPerFrame: number;
  onSeek: (frame: number) => void;
}) {
  const totalSeconds = totalFrames / fps;
  const marks = Array.from({ length: Math.floor(totalSeconds) + 1 }, (_, s) => ({
    frame: s * fps,
    label: formatTime(s),
    major: s % 5 === 0,
  }));

  return (
    <div
      className="relative h-8 bg-zinc-800/50 border-b border-white/5 cursor-pointer flex-1"
      style={{ width: totalFrames * pixelsPerFrame }}
      onClick={(e) => onSeek(clickToFrame(e, pixelsPerFrame, totalFrames))}
    >
      {marks.map(({ frame, label, major }) => (
        <div key={frame} className="absolute top-0 flex flex-col items-center" style={{ left: frame * pixelsPerFrame }}>
          <div className={`w-px ${major ? "h-5 bg-white/40" : "h-2.5 bg-white/20"}`} />
          {major && <span className="text-[11px] text-white/50 mt-0.5 select-none">{label}</span>}
        </div>
      ))}
    </div>
  );
});

const Track = memo(function Track({
  overlay,
  totalFrames,
  pixelsPerFrame,
  selected,
  onSelect,
  onUpdateTiming,
  onSeek,
}: {
  overlay: Overlay;
  totalFrames: number;
  pixelsPerFrame: number;
  selected: boolean;
  onSelect: () => void;
  onUpdateTiming: (start: number, end: number) => void;
  onSeek: (frame: number) => void;
}) {
  const colors = OVERLAY_COLORS[overlay.type];
  const label = overlay.type === "glass" ? "Glass" : (overlay as TextOverlayData).text?.slice(0, 12) || "Text";

  return (
    <div className="flex border-b border-white/5 hover:bg-white/[0.02]">
      <div className="w-24 shrink-0 px-3 py-2 flex items-center gap-2 border-r border-white/10 bg-zinc-900/50">
        <div className={`w-2 h-2 rounded-full ${colors.bg}`} />
        <span className="text-xs text-white/60 truncate">{label}</span>
      </div>
      <div
        className="relative h-14 flex-1"
        style={{ width: totalFrames * pixelsPerFrame }}
        onClick={(e) => e.target === e.currentTarget && onSeek(clickToFrame(e, pixelsPerFrame, totalFrames))}
      >
        <Clip
          overlay={overlay}
          totalFrames={totalFrames}
          pixelsPerFrame={pixelsPerFrame}
          selected={selected}
          onSelect={onSelect}
          onUpdateTiming={onUpdateTiming}
        />
      </div>
    </div>
  );
});

const Clip = memo(function Clip({
  overlay,
  totalFrames,
  pixelsPerFrame,
  selected,
  onSelect,
  onUpdateTiming,
}: {
  overlay: Overlay;
  totalFrames: number;
  pixelsPerFrame: number;
  selected: boolean;
  onSelect: () => void;
  onUpdateTiming: (start: number, end: number) => void;
}) {
  const [drag, setDrag] = useState<"move" | "left" | "right" | null>(null);
  const start = useRef({ mouseX: 0, startFrame: 0, endFrame: 0 });

  const colors = OVERLAY_COLORS[overlay.type];
  const left = overlay.startFrame * pixelsPerFrame;
  const width = Math.max((overlay.endFrame - overlay.startFrame) * pixelsPerFrame, 20);

  const beginDrag = (e: React.MouseEvent, mode: "move" | "left" | "right") => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    setDrag(mode);
    start.current = { mouseX: e.clientX, startFrame: overlay.startFrame, endFrame: overlay.endFrame };
  };

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - start.current.mouseX;
      const delta = Math.round(dx / pixelsPerFrame);
      const duration = start.current.endFrame - start.current.startFrame;

      if (drag === "move") {
        const newStart = Math.max(0, Math.min(totalFrames - duration, start.current.startFrame + delta));
        onUpdateTiming(newStart, newStart + duration);
      } else if (drag === "left") {
        const newStart = Math.max(0, Math.min(start.current.endFrame - MIN_CLIP_DURATION, start.current.startFrame + delta));
        onUpdateTiming(newStart, start.current.endFrame);
      } else {
        const newEnd = Math.max(start.current.startFrame + MIN_CLIP_DURATION, Math.min(totalFrames, start.current.endFrame + delta));
        onUpdateTiming(start.current.startFrame, newEnd);
      }
    };

    const onUp = () => setDrag(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [drag, pixelsPerFrame, totalFrames, onUpdateTiming]);

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-md border cursor-move ${colors.clip} ${selected ? "ring-2 ring-white/50" : ""}`}
      style={{ left, width }}
      onMouseDown={(e) => beginDrag(e, "move")}
    >
      <div className="absolute left-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/20 rounded-l-md" onMouseDown={(e) => beginDrag(e, "left")} />
      <div className="absolute inset-0 flex items-center justify-center px-3">
        <span className="text-xs text-white/80 truncate select-none">
          {overlay.type === "glass" ? "Glass" : (overlay as TextOverlayData).text?.slice(0, 20)}
        </span>
      </div>
      <div className="absolute right-0 top-0 w-2 h-full cursor-ew-resize hover:bg-white/20 rounded-r-md" onMouseDown={(e) => beginDrag(e, "right")} />
    </div>
  );
});

function Playhead({ playerRef, pixelsPerFrame }: { playerRef: React.RefObject<PlayerRef | null>; pixelsPerFrame: number }) {
  const frame = usePlayerFrame(playerRef);
  return (
    <div className="absolute top-0 h-full w-px bg-white pointer-events-none z-20" style={{ left: frame * pixelsPerFrame }}>
      <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-white" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }} />
    </div>
  );
}
