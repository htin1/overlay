"use client";

import { Player } from "@remotion/player";
import { useState, useRef, useEffect } from "react";
import { VideoComposition, Overlay, GlassOverlayData, TextOverlayData } from "../remotion/Composition";
import { DraggableOverlay } from "../components/DraggableOverlay";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const FONTS = ["Open Sans", "Arial", "Georgia", "Courier New", "Impact"];

const createGlass = (): GlassOverlayData => ({
  id: crypto.randomUUID(),
  type: "glass",
  mediaSrc: "",
  mediaX: 10, mediaY: 10, mediaW: 80, mediaH: 80,
  x: 5, y: 60, w: 20, h: 25,
});

const createText = (): TextOverlayData => ({
  id: crypto.randomUUID(),
  type: "text",
  text: "Your text",
  fontSize: 48,
  fontFamily: "Open Sans",
  x: 5, y: 50, w: 50, h: 10,
});

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = (id: string, data: Partial<Overlay>) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } as Overlay : o)));

  const remove = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const add = (type: "glass" | "text") => {
    const o = type === "glass" ? createGlass() : createText();
    setOverlays((prev) => [...prev, o]);
    setSelectedId(o.id);
  };

  const selected = overlays.find((o) => o.id === selectedId);

  return (
    <div className="h-screen bg-zinc-950 text-white flex">
      <div className="w-80 p-4 space-y-4 overflow-y-auto border-r border-zinc-800">
        <h1 className="text-xl font-medium">Overlay</h1>

        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Video URL"
          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm"
        />

        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-400">Overlays</span>
          <div className="flex gap-2">
            <button onClick={() => add("glass")} className="px-2 py-1 bg-zinc-800 rounded text-xs hover:bg-zinc-700">+ Glass</button>
            <button onClick={() => add("text")} className="px-2 py-1 bg-zinc-800 rounded text-xs hover:bg-zinc-700">+ Text</button>
          </div>
        </div>

        {overlays.map((o) => (
          <div
            key={o.id}
            onClick={() => setSelectedId(o.id)}
            className={`p-3 rounded-lg border space-y-2 cursor-pointer ${
              selectedId === o.id ? "border-blue-500 bg-blue-500/10" : "border-zinc-800 bg-zinc-900"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-xs px-2 py-0.5 bg-zinc-700 rounded">{o.type === "glass" ? "Glass" : "Text"}</span>
              <button onClick={(e) => { e.stopPropagation(); remove(o.id); }} className="text-zinc-500 hover:text-red-500">×</button>
            </div>

            {o.type === "glass" ? (
              <input
                value={o.mediaSrc}
                onChange={(e) => update(o.id, { mediaSrc: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Image/Video URL"
                className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
              />
            ) : (
              <>
                <input
                  value={o.text}
                  onChange={(e) => update(o.id, { text: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Text"
                  className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
                />
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="w-12">Size {o.fontSize}</span>
                  <input
                    type="range" min={16} max={120} value={o.fontSize}
                    onChange={(e) => update(o.id, { fontSize: +e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1"
                  />
                </div>
                <select
                  value={o.fontFamily}
                  onChange={(e) => update(o.id, { fontFamily: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
                >
                  {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div ref={containerRef} className="relative rounded-xl overflow-hidden bg-black w-full max-w-5xl">
          <Player
            component={VideoComposition}
            inputProps={{ videoSrc: videoUrl, overlays }}
            durationInFrames={900}
            fps={30}
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
            {selected?.type === "glass" && selected.mediaSrc && (
              <MediaHandle overlay={selected} onUpdate={(d) => update(selected.id, d)} containerRef={containerRef} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaHandle({
  overlay,
  onUpdate,
  containerRef,
}: {
  overlay: GlassOverlayData;
  onUpdate: (data: Partial<GlassOverlayData>) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
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
