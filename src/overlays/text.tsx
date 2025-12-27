"use client";

import type { BaseOverlay, OverlayDefinition } from "./base";
import { TOTAL_FRAMES, FONTS } from "@/lib/constants";

export interface TextOverlayData extends BaseOverlay {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
}

const input = "bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";

export const textOverlay: OverlayDefinition<TextOverlayData> = {
  type: "text",

  isType: (o): o is TextOverlayData => o.type === "text",

  create: (overrides) => ({
    id: crypto.randomUUID(),
    type: "text",
    text: "Your text",
    fontSize: 48,
    fontFamily: "Open Sans",
    x: 5, y: 50, w: 50, h: 10,
    startFrame: 0,
    endFrame: TOTAL_FRAMES,
    enterAnimation: "fade",
    exitAnimation: "none",
    glass: false,
    ...overrides,
  }),

  render: ({ overlay }) => (
    <p
      style={{
        color: "white",
        fontSize: overlay.fontSize,
        fontFamily: overlay.fontFamily,
        fontWeight: 600,
        textShadow: overlay.glass ? "none" : "0 2px 8px rgba(0, 0, 0, 0.5)",
        margin: 0,
        lineHeight: 1.2,
        padding: overlay.glass ? 16 : 0,
      }}
    >
      {overlay.text}
    </p>
  ),

  editor: ({ overlay, onUpdate }) => (
    <div className="space-y-3">
      <input
        value={overlay.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        placeholder="Text"
        className={`w-full ${input}`}
      />
      <div className="flex items-center gap-3 text-xs text-white/40">
        <span className="w-10">{overlay.fontSize}</span>
        <input
          type="range" min={16} max={120} value={overlay.fontSize}
          onChange={(e) => onUpdate({ fontSize: +e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 accent-white/30"
        />
      </div>
      <select
        value={overlay.fontFamily}
        onChange={(e) => onUpdate({ fontFamily: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${input}`}
      >
        {FONTS.map((f) => <option key={f} value={f} className="bg-zinc-900">{f}</option>)}
      </select>
    </div>
  ),
};
