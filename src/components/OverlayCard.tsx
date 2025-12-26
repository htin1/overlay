"use client";

import { Upload } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { ANIMATION_TYPES, AnimationType, Overlay, isMediaOverlay, isTextOverlay } from "@/remotion/Composition";
import { FONTS, OVERLAY_COLORS, ANIMATION_LABELS } from "@/lib/constants";

const input = "bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";
const btnIcon = "text-white/40 hover:text-white hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-all";

interface Props {
  overlay: Overlay;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (data: Partial<Overlay>) => void;
  onRemove: () => void;
}

export function OverlayCard({ overlay, selected, onSelect, onUpdate, onRemove }: Props) {
  const colors = OVERLAY_COLORS[overlay.type];

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg space-y-4 cursor-pointer transition-all ${
        selected ? "bg-white/10" : "bg-white/5 hover:bg-white/[0.07]"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className={`text-xs text-white/50 capitalize`}>
            {overlay.type}
          </span>
          <Toggle
            size="sm"
            pressed={overlay.glass || false}
            onPressedChange={(pressed) => onUpdate({ glass: pressed })}
            onClick={(e) => e.stopPropagation()}
            className="h-6 px-2 text-[10px] text-white/40 data-[state=on]:bg-white/10 data-[state=on]:text-white"
          >
            Glass
          </Toggle>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="text-white/30 hover:text-red-400 transition-colors text-lg"
        >
          ×
        </button>
      </div>

      {isMediaOverlay(overlay) && (
        <div className="flex gap-2">
          <input
            value={overlay.src}
            onChange={(e) => onUpdate({ src: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder={`${overlay.type === "image" ? "Image" : "Video"} URL`}
            className={`flex-1 ${input}`}
          />
          <label className={btnIcon}>
            <Upload size={14} />
            <input
              type="file"
              accept={overlay.type === "image" ? "image/*" : "video/*"}
              className="hidden"
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpdate({ src: URL.createObjectURL(file) });
              }}
            />
          </label>
        </div>
      )}

      {isTextOverlay(overlay) && (
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
      )}

      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Enter</span>
          <select
            value={overlay.enterAnimation || "fade"}
            onChange={(e) => onUpdate({ enterAnimation: e.target.value as AnimationType })}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${input} py-1.5 text-xs`}
          >
            {ANIMATION_TYPES.map((a) => (
              <option key={a} value={a} className="bg-zinc-900">{ANIMATION_LABELS[a]}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1.5">
          <span className="text-[10px] text-white/30 uppercase tracking-widest">Exit</span>
          <select
            value={overlay.exitAnimation || "none"}
            onChange={(e) => onUpdate({ exitAnimation: e.target.value as AnimationType })}
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${input} py-1.5 text-xs`}
          >
            {ANIMATION_TYPES.map((a) => (
              <option key={a} value={a} className="bg-zinc-900">{ANIMATION_LABELS[a]}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
