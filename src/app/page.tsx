"use client";

import { Player } from "@remotion/player";
import { useState } from "react";
import { VideoComposition, CompositionProps } from "../remotion/Composition";

const SAMPLE_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

type Position = "bottom-left" | "bottom-right" | "center";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState(SAMPLE_VIDEO);
  const [overlayText, setOverlayText] = useState("Your text overlay");
  const [overlayImage, setOverlayImage] = useState("");
  const [position, setPosition] = useState<Position>("bottom-left");

  const inputProps: CompositionProps = {
    videoSrc: videoUrl,
    overlayText,
    overlayImage: overlayImage || undefined,
    overlayPosition: position,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-medium">Overlay</h1>

        <div className="rounded-xl overflow-hidden bg-black">
          <Player
            component={VideoComposition}
            inputProps={inputProps}
            durationInFrames={900}
            fps={30}
            compositionWidth={1920}
            compositionHeight={1080}
            style={{ width: "100%" }}
            controls
            acknowledgeRemotionLicense
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Video URL</span>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Overlay Text</span>
            <input
              type="text"
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Enter text..."
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Image URL (optional)</span>
            <input
              type="url"
              value={overlayImage}
              onChange={(e) => setOverlayImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-zinc-400">Position</span>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as Position)}
              className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600"
            >
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="center">Center</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
