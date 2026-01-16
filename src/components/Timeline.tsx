"use client";

import React, { useRef, useCallback, memo, useState } from "react";
import { PlayerRef } from "@remotion/player";
import { useOverlayContext } from "@/contexts/OverlayContext";
import { usePlayerFrame } from "../hooks/usePlayerFrame";
import { useDrag } from "../hooks/useDrag";
import { ZoomIn, ZoomOut } from "lucide-react";
import { clickToFrame, formatTime } from "../lib/utils";
import { OVERLAY_COLORS, TIMELINE_CONFIG } from "../lib/constants";
import type { Overlay } from "@/overlays";

const { BASE_PIXELS_PER_FRAME, MIN_ZOOM, MAX_ZOOM, MIN_CLIP_DURATION, TRACK_LABEL_WIDTH } = TIMELINE_CONFIG;

interface TimelineProps {
  playerRef: React.RefObject<PlayerRef | null>;
  totalFrames: number;
  fps: number;
}

export function Timeline({ playerRef, totalFrames, fps }: TimelineProps) {
  const { overlays, selectedId, setSelectedId, updateTiming } = useOverlayContext();
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pixelsPerFrame = BASE_PIXELS_PER_FRAME * zoom;
  const timelineWidth = totalFrames * pixelsPerFrame;
  const seek = (frame: number) => playerRef.current?.seekTo(frame);

  return (
    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-white/5 min-w-0">
      <div className="flex items-center justify-end px-4 py-2 border-b border-zinc-200 dark:border-white/5">
        <div className="flex items-center gap-2">
          <ZoomOut size={12} className="text-zinc-400" />
          <ZoomSlider zoom={zoom} onZoomChange={setZoom} />
          <ZoomIn size={12} className="text-zinc-400" />
          <span className="text-[10px] text-zinc-500 w-10 text-right">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      <div ref={scrollRef} className="relative overflow-x-auto overflow-y-auto" style={{ minHeight: 200, maxHeight: 400 }}>
        <div className="relative inline-block" style={{ minWidth: "100%", width: timelineWidth + TRACK_LABEL_WIDTH }}>
          <div className="flex sticky top-0 z-10">
            <div className="w-24 shrink-0 h-8 border-r border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900/80" />
            <Ruler totalFrames={totalFrames} fps={fps} pixelsPerFrame={pixelsPerFrame} onSeek={seek} />
          </div>

          <div className="relative">
            {overlays.map((overlay) => (
              <Track
                key={overlay.id}
                overlay={overlay}
                totalFrames={totalFrames}
                pixelsPerFrame={pixelsPerFrame}
                selected={selectedId === overlay.id}
                onSelect={() => setSelectedId(overlay.id)}
                onUpdateTiming={(s, e) => updateTiming(overlay.id, s, e)}
                onSeek={seek}
              />
            ))}

            {overlays.length > 0 && (
              <div className="absolute top-0 h-full pointer-events-none" style={{ left: TRACK_LABEL_WIDTH, width: timelineWidth }}>
                <Playhead playerRef={playerRef} pixelsPerFrame={pixelsPerFrame} />
              </div>
            )}
          </div>
        </div>

        {overlays.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm pointer-events-none">
            Add an overlay to see it here
          </div>
        )}
      </div>
    </div>
  );
}

function ZoomSlider({ zoom, onZoomChange }: { zoom: number; onZoomChange: (z: number) => void }) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const zoomToPercent = (z: number) => ((z - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100;
  const percentToZoom = (p: number) => MIN_ZOOM + (p / 100) * (MAX_ZOOM - MIN_ZOOM);

  const updateFromX = useCallback((clientX: number) => {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    const percent = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    onZoomChange(percentToZoom(percent));
  }, [onZoomChange]);

  const { startDrag } = useDrag<"slide">({
    onDrag: (_, deltaX) => {
      const rect = sliderRef.current?.getBoundingClientRect();
      if (!rect) return;
      const currentPercent = zoomToPercent(zoom);
      const deltaPercent = (deltaX / rect.width) * 100;
      const newPercent = Math.max(0, Math.min(100, currentPercent + deltaPercent));
      onZoomChange(percentToZoom(newPercent));
    },
  });

  return (
    <div
      ref={sliderRef}
      className="relative w-24 h-4 cursor-pointer group"
      onMouseDown={(e) => {
        updateFromX(e.clientX);
        startDrag(e, "slide");
      }}
    >
      <div className="absolute top-1/2 -translate-y-1/2 w-full h-1 bg-zinc-300 dark:bg-white/10 rounded-full" />
      <div className="absolute top-1/2 -translate-y-1/2 h-1 bg-zinc-500 dark:bg-white/30 rounded-full" style={{ width: `${zoomToPercent(zoom)}%` }} />
      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-zinc-700 dark:bg-white rounded-full shadow-md transition-transform group-hover:scale-110" style={{ left: `calc(${zoomToPercent(zoom)}% - 6px)` }} />
    </div>
  );
}

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
      className="relative h-8 bg-zinc-100 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-white/5 cursor-pointer flex-1"
      style={{ width: totalFrames * pixelsPerFrame }}
      onClick={(e) => onSeek(clickToFrame(e, pixelsPerFrame, totalFrames))}
    >
      {marks.map(({ frame, label, major }) => (
        <div key={frame} className="absolute top-0 flex flex-col items-center" style={{ left: frame * pixelsPerFrame }}>
          <div className={`w-px ${major ? "h-5 bg-zinc-400 dark:bg-white/40" : "h-2.5 bg-zinc-300 dark:bg-white/20"}`} />
          {major && <span className="text-[11px] text-zinc-500 dark:text-white/50 mt-0.5 select-none">{label}</span>}
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
  const colors = OVERLAY_COLORS[overlay.type as keyof typeof OVERLAY_COLORS];
  const label = overlay.prompt?.slice(0, 12) || "Layer";

  return (
    <div className="flex border-b border-zinc-200 dark:border-white/5 hover:bg-zinc-100/50 dark:hover:bg-white/[0.02]">
      <div className="w-24 shrink-0 px-3 py-1.5 flex items-center gap-2 border-r border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900/30">
        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className="text-[10px] text-zinc-500 dark:text-white/50 truncate">{label}</span>
      </div>
      <div
        className="relative h-8 flex-1"
        style={{ width: totalFrames * pixelsPerFrame }}
        onClick={(e) => e.target === e.currentTarget && onSeek(clickToFrame(e, pixelsPerFrame, totalFrames))}
      >
        <Clip
          overlay={overlay}
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
  pixelsPerFrame,
  selected,
  onSelect,
  onUpdateTiming,
}: {
  overlay: Overlay;
  pixelsPerFrame: number;
  selected: boolean;
  onSelect: () => void;
  onUpdateTiming: (start: number, end: number) => void;
}) {
  const initial = useRef({ startFrame: 0, endFrame: 0 });
  const colors = OVERLAY_COLORS[overlay.type as keyof typeof OVERLAY_COLORS];
  const left = overlay.startFrame * pixelsPerFrame;
  const width = Math.max((overlay.endFrame - overlay.startFrame) * pixelsPerFrame, 20);

  const { startDrag } = useDrag<"move" | "left" | "right">({
    onDrag: (mode, deltaX) => {
      const delta = Math.round(deltaX / pixelsPerFrame);
      const duration = initial.current.endFrame - initial.current.startFrame;

      if (mode === "move") {
        const newStart = Math.max(0, initial.current.startFrame + delta);
        onUpdateTiming(newStart, newStart + duration);
      } else if (mode === "left") {
        const newStart = Math.max(0, Math.min(initial.current.endFrame - MIN_CLIP_DURATION, initial.current.startFrame + delta));
        onUpdateTiming(newStart, initial.current.endFrame);
      } else {
        const newEnd = Math.max(initial.current.startFrame + MIN_CLIP_DURATION, initial.current.endFrame + delta);
        onUpdateTiming(initial.current.startFrame, newEnd);
      }
    },
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, mode: "move" | "left" | "right") => {
      onSelect();
      initial.current = { startFrame: overlay.startFrame, endFrame: overlay.endFrame };
      startDrag(e, mode);
    },
    [overlay.startFrame, overlay.endFrame, onSelect, startDrag]
  );

  return (
    <div
      className={`absolute top-1 bottom-1 rounded border cursor-move ${colors.clip} ${selected ? "ring-1 ring-zinc-400 dark:ring-white/50" : ""}`}
      style={{ left, width }}
      onMouseDown={(e) => handleMouseDown(e, "move")}
    >
      <div className="absolute left-0 top-0 w-1.5 h-full cursor-ew-resize hover:bg-black/10 dark:hover:bg-white/20 rounded-l" onMouseDown={(e) => handleMouseDown(e, "left")} />
      <div className="absolute inset-0 flex items-center justify-center px-2">
        <span className="text-[10px] text-zinc-700 dark:text-white/70 truncate select-none">
          {overlay.prompt?.slice(0, 20) || "Layer"}
        </span>
      </div>
      <div className="absolute right-0 top-0 w-1.5 h-full cursor-ew-resize hover:bg-black/10 dark:hover:bg-white/20 rounded-r" onMouseDown={(e) => handleMouseDown(e, "right")} />
    </div>
  );
});

function Playhead({ playerRef, pixelsPerFrame }: { playerRef: React.RefObject<PlayerRef | null>; pixelsPerFrame: number }) {
  const frame = usePlayerFrame(playerRef);
  return (
    <div className="absolute top-0 h-full w-px bg-zinc-900 dark:bg-white pointer-events-none z-20" style={{ left: frame * pixelsPerFrame }}>
      <div className="absolute -top-0 -left-1.5 w-3 h-3 bg-zinc-900 dark:bg-white" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }} />
    </div>
  );
}
