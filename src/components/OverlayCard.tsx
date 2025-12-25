"use client";

import { Upload } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { ANIMATION_TYPES, AnimationType, Overlay, isMediaOverlay, isTextOverlay } from "@/remotion/Composition";
import { FONTS, OVERLAY_COLORS, ANIMATION_LABELS } from "@/lib/constants";

const glass = "bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg";
const glassHover = "hover:bg-white/15 hover:border-white/30";
const glassInput = `${glass} px-3 py-2 rounded-xl text-sm placeholder:text-white/40 focus:outline-none focus:border-white/40`;
const glassBtn = `${glass} ${glassHover} px-3 py-1.5 rounded-xl text-sm cursor-pointer transition-all`;

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
      className={`p-3 rounded-xl backdrop-blur-xl border shadow-lg space-y-3 cursor-pointer transition-all ${
        selected ? colors.cardSelected : `${colors.card} hover:bg-white/10`
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-lg border capitalize ${colors.badge}`}>
            {overlay.type}
          </span>
          <Toggle
            size="sm"
            pressed={overlay.glass || false}
            onPressedChange={(pressed) => onUpdate({ glass: pressed })}
            onClick={(e) => e.stopPropagation()}
            className="h-6 px-2 text-[10px] data-[state=on]:bg-white/20 data-[state=on]:text-white"
          >
            Glass
          </Toggle>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="text-white/40 hover:text-red-400 transition-colors"
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
            className={`flex-1 ${glassInput} py-1.5`}
          />
          <label className={`${glassBtn} flex items-center px-2`}>
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
        <>
          <input
            value={overlay.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder="Text"
            className={`w-full ${glassInput} py-1.5`}
          />
          <div className="flex items-center gap-2 text-xs text-white/50">
            <span className="w-12">Size {overlay.fontSize}</span>
            <input
              type="range" min={16} max={120} value={overlay.fontSize}
              onChange={(e) => onUpdate({ fontSize: +e.target.value })}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 accent-white/50"
            />
          </div>
          <select
            value={overlay.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
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
            value={overlay.enterAnimation || "fade"}
            onChange={(e) => onUpdate({ enterAnimation: e.target.value as AnimationType })}
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
            value={overlay.exitAnimation || "none"}
            onChange={(e) => onUpdate({ exitAnimation: e.target.value as AnimationType })}
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
  );
}
