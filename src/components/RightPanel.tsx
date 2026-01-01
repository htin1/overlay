"use client";

import { X, Trash2 } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { getOverlayDefinition, type Overlay, type BaseOverlay } from "@/lib/overlays/registry";
import { ANIMATION_TYPES, type AnimationType } from "@/lib/overlays/base";
import { ANIMATION_LABELS } from "@/lib/constants";

interface Props {
  overlay: Overlay;
  onUpdate: (data: Partial<Overlay>) => void;
  onRemove: () => void;
  onClose: () => void;
}

const input = "bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";

export function RightPanel({ overlay, onUpdate, onRemove, onClose }: Props) {
  const definition = getOverlayDefinition(overlay.type);

  return (
    <div className="w-72 border-l border-white/5 bg-zinc-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
        <span className="text-sm text-white/70">Overlay</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onRemove}
            className="text-white/30 hover:text-red-400 p-1.5 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 p-1.5 rounded transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type + Glass toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40 uppercase tracking-widest">{overlay.type}</span>
          <Toggle
            size="sm"
            pressed={overlay.glass || false}
            onPressedChange={(pressed) => onUpdate({ glass: pressed })}
            className="h-6 px-2 text-[10px] text-white/40 data-[state=on]:bg-white/10 data-[state=on]:text-white"
          >
            Glass
          </Toggle>
        </div>

        {/* Type-specific editor from registry */}
        {definition?.editor({
          overlay: overlay as BaseOverlay,
          onUpdate: onUpdate as (data: Partial<BaseOverlay>) => void,
        })}

        {/* Animation controls */}
        <div className="space-y-2 pt-2">
          <span className="text-xs text-white/40 uppercase tracking-widest">Animations</span>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-white/30">Enter</span>
              <select
                value={overlay.enterAnimation || "fade"}
                onChange={(e) => onUpdate({ enterAnimation: e.target.value as AnimationType })}
                className={`w-full ${input} py-1.5 text-xs`}
              >
                {ANIMATION_TYPES.map((a) => (
                  <option key={a} value={a} className="bg-zinc-900">{ANIMATION_LABELS[a]}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-white/30">Exit</span>
              <select
                value={overlay.exitAnimation || "none"}
                onChange={(e) => onUpdate({ exitAnimation: e.target.value as AnimationType })}
                className={`w-full ${input} py-1.5 text-xs`}
              >
                {ANIMATION_TYPES.map((a) => (
                  <option key={a} value={a} className="bg-zinc-900">{ANIMATION_LABELS[a]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
