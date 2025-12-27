"use client";

import { useCurrentFrame } from "remotion";
import { Toggle } from "@/components/ui/toggle";
import type { BaseOverlay, OverlayDefinition } from "./base";
import { TOTAL_FRAMES, FONTS } from "@/lib/constants";

export interface TypingTextOverlayData extends BaseOverlay {
  type: "typing-text";
  text: string;
  fontSize: number;
  fontFamily: string;
  cursorBlink?: boolean;
}

const input = "bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";

const trafficLightStyle = (color: string) => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: color,
  boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.2)",
});

function TypingTextRenderer({ overlay, durationInFrames }: { overlay: TypingTextOverlayData; durationInFrames: number }) {
  const frame = useCurrentFrame();
  const progress = Math.min(frame / (durationInFrames * 0.8), 1);
  const visibleChars = Math.floor(progress * overlay.text.length);
  const displayText = overlay.text.slice(0, visibleChars);
  const showCursor = overlay.cursorBlink && Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 22px 70px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.1)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(180deg, #3D3D3D 0%, #2D2D2D 100%)",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", gap: 6 }}>
          <div style={trafficLightStyle("#FF5F57")} />
          <div style={trafficLightStyle("#FFBD2E")} />
          <div style={trafficLightStyle("#28CA41")} />
        </div>
        <span style={{ flex: 1, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
          Terminal
        </span>
        <div style={{ width: 54 }} />
      </div>
      <div style={{ flex: 1, background: "#1E1E1E", padding: 16, overflow: "hidden" }}>
        <p
          style={{
            color: "#CCCCCC",
            fontSize: overlay.fontSize,
            fontFamily: overlay.fontFamily,
            fontWeight: 400,
            margin: 0,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
          }}
        >
          {displayText}
          {overlay.cursorBlink && (
            <span
              style={{
                display: "inline-block",
                width: 2,
                height: overlay.fontSize * 1.1,
                background: "#CCCCCC",
                opacity: showCursor ? 1 : 0,
                marginLeft: 1,
                verticalAlign: "text-bottom",
              }}
            />
          )}
        </p>
      </div>
    </div>
  );
}

export const typingTextOverlay: OverlayDefinition<TypingTextOverlayData> = {
  type: "typing-text",

  isType: (o): o is TypingTextOverlayData => o.type === "typing-text",

  create: (overrides) => ({
    id: crypto.randomUUID(),
    type: "typing-text",
    text: "Hello, world!",
    fontSize: 16,
    fontFamily: "JetBrains Mono",
    cursorBlink: true,
    x: 5, y: 50, w: 45, h: 25,
    startFrame: 0,
    endFrame: Math.floor(TOTAL_FRAMES / 2),
    enterAnimation: "fade",
    exitAnimation: "fade",
    glass: false,
    ...overrides,
  }),

  render: (props) => <TypingTextRenderer {...props} />,

  editor: ({ overlay, onUpdate }) => (
    <div className="space-y-3">
      <textarea
        value={overlay.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        placeholder="Text to type..."
        rows={3}
        className={`w-full ${input} resize-none`}
      />
      <div className="flex items-center gap-3 text-xs text-white/40">
        <span className="w-10">{overlay.fontSize}</span>
        <input
          type="range" min={12} max={72} value={overlay.fontSize}
          onChange={(e) => onUpdate({ fontSize: +e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 accent-white/30"
        />
      </div>
      <div className="flex items-center gap-3">
        <select
          value={overlay.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className={`flex-1 ${input}`}
        >
          {FONTS.map((f) => <option key={f} value={f} className="bg-zinc-900">{f}</option>)}
        </select>
        <Toggle
          size="sm"
          pressed={overlay.cursorBlink || false}
          onPressedChange={(pressed) => onUpdate({ cursorBlink: pressed })}
          onClick={(e) => e.stopPropagation()}
          className="h-8 px-3 text-xs text-white/40 data-[state=on]:bg-white/10 data-[state=on]:text-white"
        >
          Cursor
        </Toggle>
      </div>
    </div>
  ),
};
