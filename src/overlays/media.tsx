"use client";

import { Img, OffthreadVideo } from "remotion";
import { Upload } from "lucide-react";
import type { BaseOverlay, OverlayDefinition } from "./base";
import { TOTAL_FRAMES } from "@/lib/constants";

export interface MediaOverlayData extends BaseOverlay {
  type: "media";
  src: string;
  mediaX: number;
  mediaY: number;
  mediaW: number;
  mediaH: number;
}

const input = "bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";
const btnIcon = "text-white/40 hover:text-white hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-all";

const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];

function isVideoSrc(src: string): boolean {
  const lower = src.toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext));
}

export const mediaOverlay: OverlayDefinition<MediaOverlayData> = {
  type: "media",

  isType: (o): o is MediaOverlayData => o.type === "media",

  create: (overrides) => ({
    id: crypto.randomUUID(),
    type: "media",
    src: "",
    x: 5, y: 60, w: 20, h: 25,
    mediaX: 10, mediaY: 10, mediaW: 80, mediaH: 80,
    startFrame: 0,
    endFrame: TOTAL_FRAMES,
    enterAnimation: "fade",
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

    if (isVideoSrc(overlay.src)) {
      return <OffthreadVideo src={overlay.src} style={style} />;
    }
    return <Img src={overlay.src} style={style} />;
  },

  editor: ({ overlay, onUpdate }) => (
    <div className="flex gap-2">
      <input
        value={overlay.src}
        onChange={(e) => onUpdate({ src: e.target.value })}
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
            if (file) onUpdate({ src: URL.createObjectURL(file) });
          }}
        />
      </label>
    </div>
  ),
};
