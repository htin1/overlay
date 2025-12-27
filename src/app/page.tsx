"use client";

import { Player, PlayerRef } from "@remotion/player";
import { useState, useRef, useEffect } from "react";
import { Upload, Plus, Image, Film, Type } from "lucide-react";
import { VideoComposition } from "../lib/remotion/Composition";
import { type Overlay, isMediaOverlay } from "@/lib/overlays/registry";
import { DraggableOverlay } from "../components/DraggableOverlay";
import { Timeline } from "../components/Timeline";
import { MediaHandle } from "../components/MediaHandle";
import { OverlayCard } from "../components/OverlayCard";
import { TemplateLibrary } from "../components/TemplateLibrary";
import { SAMPLE_VIDEO, TOTAL_FRAMES, FPS } from "../lib/constants";
import { createImage, createVideo, createText } from "../lib/utils";

const input = "bg-white/5 px-4 py-2.5 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";
const btnIcon = "text-white/50 hover:text-white hover:bg-white/5 p-2.5 rounded-lg cursor-pointer transition-all";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<PlayerRef>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setAddMenuOpen(false);
  };

  const addFromTemplate = (overlay: Overlay) => {
    setOverlays((prev) => [...prev, overlay]);
    setSelectedId(overlay.id);
  };

  const selected = overlays.find((o) => o.id === selectedId);

  return (
    <div className="h-screen bg-zinc-950 text-white flex overflow-hidden">
      <div className="w-80 shrink-0 p-6 space-y-6 overflow-y-auto border-r border-white/5">
        <h1 className="text-lg text-white/90">Overlay</h1>

        <div className="space-y-3 pb-4 border-b border-white/5">
          <p className="text-xs text-white/40 uppercase tracking-widest">Base video</p>
          <div className="flex gap-2">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Video URL"
              className={`flex-1 ${input}`}
            />
            <label className={btnIcon}>
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
        </div>

        <div className="space-y-3 pb-4 border-b border-white/5">
          <div className="flex justify-between items-center">
            <p className="text-xs text-white/40 uppercase tracking-widest">Overlays</p>
            <div className="relative" ref={addMenuRef}>
              <button
                onClick={() => setAddMenuOpen(!addMenuOpen)}
                className="text-white/40 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-all"
              >
                <Plus size={16} />
              </button>
              {addMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg py-1 min-w-[120px] shadow-xl z-50">
                  <button
                    onClick={() => add("image")}
                    className="w-full px-3 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <Image size={14} /> Image
                  </button>
                  <button
                    onClick={() => add("video")}
                    className="w-full px-3 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <Film size={14} /> Video
                  </button>
                  <button
                    onClick={() => add("text")}
                    className="w-full px-3 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <Type size={14} /> Text
                  </button>
                </div>
              )}
            </div>
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

        <TemplateLibrary onSelect={addFromTemplate} />
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
