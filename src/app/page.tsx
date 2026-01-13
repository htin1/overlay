"use client";

import { Player, PlayerRef } from "@remotion/player";
import { useState, useRef, useCallback } from "react";
import { Minus, Plus } from "lucide-react";
import { VideoComposition } from "../remotion/Composition";
import { type Overlay, codeOverlay } from "@/overlays";
import { DraggableOverlay } from "../components/DraggableOverlay";
import { Timeline } from "../components/Timeline";
import { TopToolbar } from "../components/TopToolbar";
import { LeftPanel, type MediaItem } from "../components/LeftPanel";
import { RightPanel } from "../components/RightPanel";
import { FPS } from "../lib/constants";
import { useHistory } from "../hooks/useHistory";
import { useTheme } from "../hooks/useTheme";

const MIN_DURATION = 300;
const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function Home() {
  const { theme } = useTheme();
  const { state: overlays, set: setOverlays, undo, redo, canUndo, canRedo } = useHistory<Overlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  const totalFrames = Math.max(MIN_DURATION, ...overlays.map((o) => o.endFrame));
  const backgroundColor = theme === "dark" ? "#09090b" : "#ffffff";
  const selected = overlays.find((o) => o.id === selectedId) ?? null;
  const visibleOverlays = overlays.filter((o) => o.visible !== false);

  const update = useCallback((id: string, data: Partial<Overlay>) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } as Overlay : o))), [setOverlays]);

  const updateTiming = useCallback((id: string, startFrame: number, endFrame: number) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, startFrame, endFrame } as Overlay : o))), [setOverlays]);

  const remove = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [setOverlays, selectedId]);

  const addLayer = useCallback(() => {
    const layer = codeOverlay.create({ prompt: "" });
    setOverlays((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  }, [setOverlays]);

  const toggleVisibility = useCallback((id: string) => {
    setOverlays((prev) => prev.map((o) =>
      o.id === id ? { ...o, visible: o.visible !== false ? false : true } as Overlay : o
    ));
  }, [setOverlays]);

  const addMedia = useCallback((item: MediaItem) => {
    setMedia((prev) => [...prev, item]);
  }, []);

  const removeMedia = useCallback((id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const exportVideo = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overlays, backgroundColor, totalFrames }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        for (const line of decoder.decode(value).split("\n").filter((l) => l.startsWith("data: "))) {
          const data = JSON.parse(line.slice(6));
          if (data.type === "done") {
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
      setExporting(false);
    }
  };

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
      <TopToolbar
        onExport={exportVideo}
        exporting={exporting}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      {/* Main area: Panels + Canvas */}
      <div className="flex-1 flex min-h-0">
        {/* Left Panels - Layers + Properties */}
        <div className="flex">
          <LeftPanel
            overlays={overlays}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggleVisibility={toggleVisibility}
            onAddLayer={addLayer}
            onReorder={setOverlays}
            media={media}
            onAddMedia={addMedia}
            onRemoveMedia={removeMedia}
          />
          {selected && (
            <RightPanel
              overlay={selected}
              onUpdate={(data) => update(selected.id, data)}
              onRemove={() => remove(selected.id)}
              media={media}
            />
          )}
        </div>

        {/* Canvas area */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 min-w-0 bg-zinc-100 dark:bg-zinc-900/30">
          <div
            ref={containerRef}
            className="relative overflow-hidden bg-black shadow-lg"
            style={{
              width: `${Math.min(100, 60 * zoom)}%`,
              maxWidth: `${960 * zoom}px`,
            }}
          >
            <Player
              ref={playerRef}
              component={VideoComposition}
              inputProps={{ overlays: visibleOverlays, backgroundColor }}
              durationInFrames={totalFrames}
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
      </div>

      {/* Timeline */}
      <Timeline
        overlays={overlays}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onUpdateTiming={updateTiming}
        playerRef={playerRef}
        totalFrames={totalFrames}
        fps={FPS}
      />
    </div>
  );
}
