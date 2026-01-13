"use client";

import { Player, PlayerRef } from "@remotion/player";
import { useState, useRef, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { VideoComposition } from "../remotion/Composition";
import { type Overlay, isMediaOverlay } from "@/overlays/registry";
import { DraggableOverlay } from "../components/DraggableOverlay";
import { Timeline } from "../components/Timeline";
import { MediaHandle } from "../components/MediaHandle";
import { TopToolbar } from "../components/TopToolbar";
import { LeftPanel } from "../components/LeftPanel";
import { RightPanel } from "../components/RightPanel";
import { SAMPLE_VIDEO, TOTAL_FRAMES, FPS } from "../lib/constants";
import { createMedia, createText } from "../lib/utils";
import { useHistory } from "../hooks/useHistory";

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const { state: overlays, set: setOverlays, undo, redo, canUndo, canRedo } = useHistory<Overlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [exportStatus, setExportStatus] = useState<{ active: boolean; message: string; progress?: number }>({
    active: false,
    message: "",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  const update = useCallback((id: string, data: Partial<Overlay>) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } as Overlay : o))), [setOverlays]);

  const updateTiming = useCallback((id: string, startFrame: number, endFrame: number) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, startFrame, endFrame } as Overlay : o))), [setOverlays]);

  const remove = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [setOverlays, selectedId]);

  const add = useCallback((type: "media" | "text") => {
    const o = type === "media" ? createMedia() : createText();
    setOverlays((prev) => [...prev, o]);
    setSelectedId(o.id);
  }, [setOverlays]);

  const toggleVisibility = useCallback((id: string) => {
    setOverlays((prev) => prev.map((o) =>
      o.id === id ? { ...o, visible: o.visible === false ? true : false } as Overlay : o
    ));
  }, [setOverlays]);

  const exportVideo = async () => {
    setExportStatus({ active: true, message: "Starting..." });
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoSrc: videoUrl, overlays }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          if (data.type === "status") {
            setExportStatus({ active: true, message: data.message });
          } else if (data.type === "progress") {
            setExportStatus({ active: true, message: "Rendering...", progress: data.progress });
          } else if (data.type === "done") {
            const a = document.createElement("a");
            a.href = `/api/render/${data.filename}`;
            a.download = "export.mp4";
            a.click();
          } else if (data.type === "error") {
            throw new Error(data.message);
          }
        }
      }
    } catch (e) {
      console.error(e);
      alert("Export failed");
    } finally {
      setExportStatus({ active: false, message: "" });
    }
  };

  const selected = overlays.find((o) => o.id === selectedId) || null;
  const visibleOverlays = overlays.filter((o) => o.visible !== false);

  const zoomIn = () => {
    const idx = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1]);
  };

  const zoomOut = () => {
    const idx = ZOOM_LEVELS.findIndex((z) => z >= zoom);
    if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1]);
  };

  return (
    <div className="h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar
        onExport={exportVideo}
        exportStatus={exportStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      {/* Main area: Left Panel + Canvas + Right Panel */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panel - Layers */}
        <LeftPanel
          overlays={overlays}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggleVisibility={toggleVisibility}
          onAddOverlay={add}
        />

        {/* Canvas area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 min-w-0 bg-zinc-100 dark:bg-zinc-900/30">
          <div
            ref={containerRef}
            className="relative rounded-2xl overflow-hidden bg-black shadow-2xl"
            style={{
              width: `${Math.min(100, 60 * zoom)}%`,
              maxWidth: `${960 * zoom}px`,
            }}
          >
            <Player
              ref={playerRef}
              component={VideoComposition}
              inputProps={{ videoSrc: videoUrl, overlays: visibleOverlays }}
              durationInFrames={TOTAL_FRAMES}
              fps={FPS}
              compositionWidth={1920}
              compositionHeight={1080}
              style={{ width: "100%" }}
              controls
              acknowledgeRemotionLicense
            />
            <div className="absolute inset-0 pointer-events-none">
              {visibleOverlays.map((o) => (
                <DraggableOverlay
                  key={o.id}
                  x={o.x} y={o.y} width={o.w} height={o.h}
                  selected={selectedId === o.id}
                  onSelect={() => setSelectedId(o.id)}
                  onUpdate={(x, y, w, h) => update(o.id, { x, y, w, h })}
                  containerRef={containerRef}
                />
              ))}
              {selected && isMediaOverlay(selected) && selected.glass && selected.visible !== false && (
                <MediaHandle
                  overlay={selected}
                  onUpdate={(d) => update(selected.id, d)}
                  containerRef={containerRef}
                />
              )}
            </div>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={zoomOut}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 rounded transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs text-zinc-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={zoomIn}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 rounded transition-colors"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 rounded transition-colors"
            >
              Fit
            </button>
          </div>
        </main>

        {/* Right Panel - Properties */}
        <RightPanel
          overlay={selected}
          onUpdate={(data) => selected && update(selected.id, data)}
          onRemove={() => selected && remove(selected.id)}
        />
      </div>

      {/* Timeline */}
      <Timeline
        overlays={overlays}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onUpdateTiming={updateTiming}
        playerRef={playerRef}
        totalFrames={TOTAL_FRAMES}
        fps={FPS}
      />
    </div>
  );
}
