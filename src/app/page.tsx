"use client";

import { Player } from "@remotion/player";
import { useState, useRef } from "react";
import { VideoComposition } from "../remotion/Composition";
import { DraggableOverlay } from "../components/DraggableOverlay";

const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const [text, setText] = useState("Your text overlay");
  const [image, setImage] = useState("");
  const [imageSize, setImageSize] = useState(200);
  const [box, setBox] = useState({ x: 5, y: 70, w: 25, h: 15 });
  const containerRef = useRef<HTMLDivElement>(null);

  const hasOverlay = text || image;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-medium">Overlay</h1>

        <div ref={containerRef} className="relative rounded-xl overflow-hidden bg-black">
          <Player
            component={VideoComposition}
            inputProps={{ videoSrc: videoUrl, text, image, imageSize, ...box }}
            durationInFrames={900}
            fps={30}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: "100%" }}
            controls
            acknowledgeRemotionLicense
          />
          {hasOverlay && (
            <div className="absolute inset-0 pointer-events-none">
              <DraggableOverlay
                {...box}
                width={box.w}
                height={box.h}
                onUpdate={(x, y, w, h) => setBox({ x, y, w, h })}
                containerRef={containerRef}
              />
            </div>
          )}
        </div>

        <p className="text-sm text-zinc-500">Drag to move, corner to resize</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Video URL" value={videoUrl} onChange={setVideoUrl} />
          <Input label="Overlay Text" value={text} onChange={setText} />
          <Input label="Image URL" value={image} onChange={setImage} />
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Image Size ({imageSize}px)</span>
            <input
              type="range"
              min={32}
              max={400}
              value={imageSize}
              onChange={(e) => setImageSize(Number(e.target.value))}
              className="w-full"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, className = "" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="text-sm text-zinc-400">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
      />
    </label>
  );
}
