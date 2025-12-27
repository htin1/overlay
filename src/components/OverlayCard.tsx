"use client";

import { Toggle } from "./ui/toggle";
import { getOverlayDefinition, type Overlay, type BaseOverlay } from "@/overlays/registry";
import { ANIMATION_TYPES, type AnimationType } from "@/overlays/base";
import { ANIMATION_LABELS } from "@/lib/constants";

const input = "bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";

interface Props {
  overlay: Overlay;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (data: Partial<Overlay>) => void;
  onRemove: () => void;
}

export function OverlayCard({ overlay, selected, onSelect, onUpdate, onRemove }: Props) {
  const definition = getOverlayDefinition(overlay.type);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg space-y-4 cursor-pointer transition-all ${
        selected ? "bg-white/10" : "bg-white/5 hover:bg-white/[0.07]"
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/50 capitalize">{overlay.type}</span>
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

      {/* Type-specific editor from registry */}
      {definition?.editor({
        overlay: overlay as BaseOverlay,
        onUpdate: onUpdate as (data: Partial<BaseOverlay>) => void,
      })}

      {/* Animation controls */}
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
