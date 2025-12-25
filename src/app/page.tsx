"use client";

import { Player } from "@remotion/player";
import { useState, useRef } from "react";
import { VideoComposition, Overlay } from "../remotion/Composition";
import { DraggableOverlay } from "../components/DraggableOverlay";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const createOverlay = (): Overlay => ({
  id: crypto.randomUUID(),
  text: "New overlay",
  image: "",
  imageSize: 64,
  x: 5 + Math.random() * 20,
  y: 60 + Math.random() * 20,
  w: 25,
  h: 15,
});

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const [overlays, setOverlays] = useState<Overlay[]>([createOverlay()]);
  const [selectedId, setSelectedId] = useState<string | null>(overlays[0]?.id ?? null);
  const containerRef = useRef<HTMLDivElement>(null);

  const update = (id: string, data: Partial<Overlay>) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o)));

  const remove = (id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const add = () => {
    const o = createOverlay();
    setOverlays((prev) => [...prev, o]);
    setSelectedId(o.id);
  };

  return (
    <div className="h-screen bg-zinc-950 text-white flex">
      {/* Sidebar */}
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
          <button onClick={add} className="px-3 py-1 bg-zinc-800 rounded text-sm hover:bg-zinc-700">
            + Add
          </button>
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
              <span className="text-sm font-medium truncate">{o.text || "Untitled"}</span>
              <button
                onClick={(e) => { e.stopPropagation(); remove(o.id); }}
                className="text-zinc-500 hover:text-red-500"
              >
                ×
              </button>
            </div>
            <input
              value={o.text}
              onChange={(e) => update(o.id, { text: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Text"
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
            />
            <input
              value={o.image}
              onChange={(e) => update(o.id, { image: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Image URL"
              className="w-full px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm"
            />
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-12">Size {o.imageSize}</span>
              <input
                type="range"
                min={32}
                max={400}
                value={o.imageSize}
                onChange={(e) => update(o.id, { imageSize: +e.target.value })}
                onClick={(e) => e.stopPropagation()}
                className="flex-1"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Player */}
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
                x={o.x}
                y={o.y}
                width={o.w}
                height={o.h}
                selected={selectedId === o.id}
                onSelect={() => setSelectedId(o.id)}
                onUpdate={(x, y, w, h) => update(o.id, { x, y, w, h })}
                containerRef={containerRef}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
