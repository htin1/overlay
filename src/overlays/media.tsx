"use client";

import { Img, OffthreadVideo } from "remotion";
import { Upload } from "lucide-react";
import type { BaseOverlay, OverlayDefinition } from "./base";
import { TOTAL_FRAMES, FPS } from "@/lib/constants";

export interface MediaOverlayData extends BaseOverlay {
  type: "media";
  src: string;
  mimeType?: string;
  mediaX: number;
  mediaY: number;
  mediaW: number;
  mediaH: number;
}

const input = "bg-zinc-100 dark:bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none focus:bg-zinc-200 dark:focus:bg-white/10 transition-colors";
const btnIcon = "text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-all";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];

function isVideo(src: string, mimeType?: string): boolean {
  if (mimeType) {
    return mimeType.startsWith("video/");
  }
  const lower = src.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext));
}

function getVideoDuration(src: string): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const frames = Math.round(video.duration * FPS);
      resolve(frames);
    };
    video.onerror = () => resolve(TOTAL_FRAMES);
    video.src = src;
  });
}

export const mediaOverlay: OverlayDefinition<MediaOverlayData> = {
  type: "media",

  isType: (o): o is MediaOverlayData => o.type === "media",

  create: (overrides) => ({
    id: crypto.randomUUID(),
    type: "media",
    src: "",
    x: 0, y: 0, w: 100, h: 100,
    mediaX: 10, mediaY: 10, mediaW: 80, mediaH: 80,
    startFrame: 0,
    endFrame: TOTAL_FRAMES,
    enterAnimation: "none",
    exitAnimation: "none",
    glass: false,
    ...overrides,
  }),

  render: ({ overlay }) => {
    if (!overlay.src) return null;

    const style = overlay.glass
      ? {
          position: "absolute" as const,
          left: `${overlay.mediaX}%`,
          top: `${overlay.mediaY}%`,
          width: `${overlay.mediaW}%`,
          height: `${overlay.mediaH}%`,
          objectFit: "cover" as const,
          borderRadius: 12,
        }
      : {
          width: "100%",
          height: "100%",
          objectFit: "cover" as const,
        };

    if (isVideo(overlay.src, overlay.mimeType)) {
      return <OffthreadVideo src={overlay.src} style={style} />;
    }
    return <Img src={overlay.src} style={style} />;
  },

  editor: ({ overlay, onUpdate }) => {
    const handleSrcChange = async (src: string, mimeType?: string) => {
      onUpdate({ src, mimeType });
      if (src && isVideo(src, mimeType)) {
        const endFrame = await getVideoDuration(src);
        onUpdate({ endFrame });
      }
    };

    return (
      <div className="flex gap-2">
        <input
          value={overlay.src}
          onChange={(e) => handleSrcChange(e.target.value, undefined)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Image or video URL"
          className={`flex-1 ${input}`}
        />
        <label className={btnIcon}>
          <Upload size={14} />
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSrcChange(URL.createObjectURL(file), file.type);
            }}
          />
        </label>
      </div>
    );
  },
};
