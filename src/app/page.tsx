"use client";

import { Player, PlayerRef } from "@remotion/player";
import { useState, useRef } from "react";
import { Upload } from "lucide-react";
import { VideoComposition, Overlay, ANIMATION_TYPES, AnimationType } from "../remotion/Composition";
import { DraggableOverlay } from "../components/DraggableOverlay";
import { Timeline } from "../components/Timeline";
import { MediaHandle } from "../components/MediaHandle";
import { SAMPLE_VIDEO, FONTS, TOTAL_FRAMES, FPS } from "../lib/constants";
import { createGlass, createText } from "../lib/utils";

const ANIMATION_LABELS: Record<AnimationType, string> = {
  none: "None",
  fade: "Fade",
  slideUp: "Slide Up",
  slideDown: "Slide Down",
  slideLeft: "Slide Left",
  slideRight: "Slide Right",
  scale: "Scale",
  pop: "Pop",
  wipeLeft: "Wipe Left",
  wipeRight: "Wipe Right",
  wipeUp: "Wipe Up",
  wipeDown: "Wipe Down",
  zoom: "Zoom",
  flip: "Flip",
  rotate: "Rotate",
  bounce: "Bounce",
};

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

  const add = (type: "glass" | "text") => {
    const o = type === "glass" ? createGlass() : createText();
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
          <div className="flex gap-2">
            <button onClick={() => add("glass")} className={`${glassBtn} text-xs`}>+ Glass</button>
            <button onClick={() => add("text")} className={`${glassBtn} text-xs`}>+ Text</button>
          </div>
        </div>

        {overlays.map((o) => (
          <div
            key={o.id}
            onClick={() => setSelectedId(o.id)}
            className={`p-3 rounded-xl backdrop-blur-xl border shadow-lg space-y-3 cursor-pointer transition-all ${
              selectedId === o.id
                ? "bg-blue-500/20 border-blue-500/50"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`text-xs px-2 py-0.5 rounded-lg ${glass}`}>
                {o.type === "glass" ? "Glass" : "Text"}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); remove(o.id); }}
                className="text-white/40 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </div>

            {o.type === "glass" ? (
              <div className="flex gap-2">
                <input
                  value={o.mediaSrc}
                  onChange={(e) => update(o.id, { mediaSrc: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Image/Video URL"
                  className={`flex-1 ${glassInput} py-1.5`}
                />
                <label className={`${glassBtn} flex items-center px-2`}>
                  <Upload size={14} />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) update(o.id, { mediaSrc: URL.createObjectURL(file) });
                    }}
                  />
                </label>
              </div>
            ) : (
              <>
                <input
                  value={o.text}
                  onChange={(e) => update(o.id, { text: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Text"
                  className={`w-full ${glassInput} py-1.5`}
                />
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="w-12">Size {o.fontSize}</span>
                  <input
                    type="range" min={16} max={120} value={o.fontSize}
                    onChange={(e) => update(o.id, { fontSize: +e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 accent-white/50"
                  />
                </div>
                <select
                  value={o.fontFamily}
                  onChange={(e) => update(o.id, { fontFamily: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full ${glassInput} py-1.5`}
                >
                  {FONTS.map((f) => <option key={f} value={f} className="bg-zinc-900">{f}</option>)}
                </select>
              </>
            )}

            {/* Animation controls */}
            <div className="flex gap-2 pt-1">
              <div className="flex-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wide">Enter</span>
                <select
                  value={o.enterAnimation || "fade"}
                  onChange={(e) => update(o.id, { enterAnimation: e.target.value as AnimationType })}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full ${glassInput} py-1 text-xs mt-1`}
                >
                  {ANIMATION_TYPES.map((a) => (
                    <option key={a} value={a} className="bg-zinc-900">{ANIMATION_LABELS[a]}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-white/40 uppercase tracking-wide">Exit</span>
                <select
                  value={o.exitAnimation || "none"}
                  onChange={(e) => update(o.id, { exitAnimation: e.target.value as AnimationType })}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full ${glassInput} py-1 text-xs mt-1`}
                >
                  {ANIMATION_TYPES.map((a) => (
                    <option key={a} value={a} className="bg-zinc-900">{ANIMATION_LABELS[a]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
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
              {selected?.type === "glass" && selected.mediaSrc && (
                <MediaHandle overlay={selected} onUpdate={(d) => update(selected.id, d)} containerRef={containerRef} />
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
