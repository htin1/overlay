"use client";

import { Player, PlayerRef } from "@remotion/player";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { VideoComposition, Overlay, isMediaOverlay } from "../remotion/Composition";
import { DraggableOverlay } from "../components/DraggableOverlay";
import { Timeline } from "../components/Timeline";
import { MediaHandle } from "../components/MediaHandle";
import { OverlayCard } from "../components/OverlayCard";
import { SAMPLE_VIDEO, TOTAL_FRAMES, FPS } from "../lib/constants";
import { createImage, createVideo, createText } from "../lib/utils";

const glass = "bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg";
const glassHover = "hover:bg-white/15 hover:border-white/30";
const glassInput = `${glass} px-3 py-2 rounded-xl text-sm placeholder:text-white/40 focus:outline-none focus:border-white/40`;
const glassBtn = `${glass} ${glassHover} px-3 py-1.5 rounded-xl text-sm cursor-pointer transition-all`;

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const selected = overlays.find((o) => o.id === selectedId);

  return (
    <div className="h-screen bg-zinc-950 text-white flex overflow-hidden">
      <div className="w-80 shrink-0 p-4 space-y-4 overflow-y-auto border-r border-white/10">
        <h1 className="text-xl font-medium">Overlay</h1>

        <p className="text-sm text-white/50">Base video</p>
        <div className="flex gap-2">
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Video URL"
            className={`flex-1 ${glassInput}`}
          />
          <label className={`${glassBtn} flex items-center`}>
            <Upload size={16} />
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setVideoUrl(URL.createObjectURL(file));
              }}
            />
          </label>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-white/50">Overlays</span>
          <div className="flex gap-1">
            <button onClick={() => add("image")} className={`${glassBtn} text-xs`}>+ Image</button>
            <button onClick={() => add("video")} className={`${glassBtn} text-xs`}>+ Video</button>
            <button onClick={() => add("text")} className={`${glassBtn} text-xs`}>+ Text</button>
          </div>
        </div>

        {overlays.map((o) => (
          <OverlayCard
            key={o.id}
            overlay={o}
            selected={selectedId === o.id}
            onSelect={() => setSelectedId(o.id)}
            onUpdate={(data) => update(o.id, data)}
            onRemove={() => remove(o.id)}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
        {/* Player area */}
        <div className="flex-1 flex items-start justify-center p-6 pt-8 min-h-0">
          <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-black w-full max-w-3xl shadow-2xl">
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
    </div>
  );
}
