"use client";

import { Player, PlayerRef } from "@remotion/player";
import { useState, useRef } from "react";
import { VideoComposition } from "../lib/remotion/Composition";
import { type Overlay, isMediaOverlay } from "@/lib/overlays/registry";
import { DraggableOverlay } from "../components/DraggableOverlay";
import { Timeline } from "../components/Timeline";
import { MediaHandle } from "../components/MediaHandle";
import { TopToolbar } from "../components/TopToolbar";
import { RightPanel } from "../components/RightPanel";
import { SAMPLE_VIDEO, TOTAL_FRAMES, FPS } from "../lib/constants";
import { createImage, createVideo, createText } from "../lib/utils";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<{ active: boolean; message: string; progress?: number }>({
    active: false,
    message: "",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);

  const update = (id: string, data: Partial<Overlay>) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } as Overlay : o)));

  const updateTiming = (id: string, startFrame: number, endFrame: number) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, startFrame, endFrame } as Overlay : o)));

  const remove = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const add = (type: "image" | "video" | "text") => {
    const o = type === "image" ? createImage() : type === "video" ? createVideo() : createText();
    setOverlays((prev) => [...prev, o]);
    setSelectedId(o.id);
  };

  const addFromTemplate = (overlay: Overlay) => {
    setOverlays((prev) => [...prev, overlay]);
    setSelectedId(overlay.id);
  };

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

  const selected = overlays.find((o) => o.id === selectedId);

  return (
    <div className="h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        onAddOverlay={add}
        onAddFromTemplate={addFromTemplate}
        onExport={exportVideo}
        exportStatus={exportStatus}
      />

      {/* Main area: Player + Right Panel */}
      <div className="flex-1 flex min-h-0">
        {/* Player area */}
        <main className="flex-1 flex items-center justify-center p-6 min-w-0">
          <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-black w-full max-w-4xl shadow-2xl">
            <Player
              ref={playerRef}
              component={VideoComposition}
              inputProps={{ videoSrc: videoUrl, overlays }}
              durationInFrames={TOTAL_FRAMES}
              fps={FPS}
              compositionWidth={1920}
              compositionHeight={1080}
              style={{ width: "100%" }}
              controls
              acknowledgeRemotionLicense
            />
            <div className="absolute inset-0 pointer-events-none">
              {overlays.map((o) => (
                <DraggableOverlay
                  key={o.id}
                  x={o.x} y={o.y} width={o.w} height={o.h}
                  selected={selectedId === o.id}
                  onSelect={() => setSelectedId(o.id)}
                  onUpdate={(x, y, w, h) => update(o.id, { x, y, w, h })}
                  containerRef={containerRef}
                />
              ))}
              {selected && isMediaOverlay(selected) && selected.glass && (
                <MediaHandle
                  overlay={selected}
                  onUpdate={(d) => update(selected.id, d)}
                  containerRef={containerRef}
                />
              )}
            </div>
          </div>
        </main>

        {/* Right Panel (contextual) */}
        {selected && (
          <RightPanel
            overlay={selected}
            onUpdate={(data) => update(selected.id, data)}
            onRemove={() => remove(selected.id)}
            onClose={() => setSelectedId(null)}
          />
        )}
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
