"use client";

import { Trash2 } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { getOverlayDefinition, type Overlay, type BaseOverlay } from "@/overlays/registry";
import { ANIMATION_TYPES, type AnimationType } from "@/overlays/base";
import { ANIMATION_LABELS } from "@/lib/constants";

interface Props {
  overlay: Overlay;
  onUpdate: (data: Partial<Overlay>) => void;
  onRemove: () => void;
}

const input = "bg-zinc-100 dark:bg-white/10 px-3 py-2 rounded-lg text-sm placeholder:text-zinc-400 focus:outline-none focus:bg-zinc-200 dark:focus:bg-white/15 transition-colors";

export function RightPanel({ overlay, onUpdate, onRemove }: Props) {
  const definition = getOverlayDefinition(overlay.type);

  return (
    <div className="w-72 border-r border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-zinc-200 dark:border-white/5 flex items-center justify-end px-4 shrink-0">
        <button onClick={onRemove} className="text-zinc-400 hover:text-red-500 p-1.5 rounded transition-colors" title="Delete layer">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Type + Glass toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">{overlay.type}</span>
          <Toggle
            size="sm"
            pressed={overlay.glass || false}
            onPressedChange={(pressed) => onUpdate({ glass: pressed })}
            className="h-6 px-2 text-[10px] text-zinc-500 data-[state=on]:bg-zinc-200 dark:data-[state=on]:bg-white/20 data-[state=on]:text-zinc-900 dark:data-[state=on]:text-white"
          >
            Glass
          </Toggle>
        </div>

        {/* Type-specific editor */}
        {definition?.editor({
          overlay: overlay as BaseOverlay,
          onUpdate: onUpdate as (data: Partial<BaseOverlay>) => void,
        })}

        {/* Animation controls */}
        <div className="space-y-2 pt-2">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">Animations</span>
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-zinc-400">Enter</span>
              <select
                value={overlay.enterAnimation || "fade"}
                onChange={(e) => onUpdate({ enterAnimation: e.target.value as AnimationType })}
                className={`w-full ${input} py-1.5 text-xs`}
              >
                {ANIMATION_TYPES.map((a) => (
                  <option key={a} value={a}>{ANIMATION_LABELS[a]}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] text-zinc-400">Exit</span>
              <select
                value={overlay.exitAnimation || "none"}
                onChange={(e) => onUpdate({ exitAnimation: e.target.value as AnimationType })}
                className={`w-full ${input} py-1.5 text-xs`}
              >
                {ANIMATION_TYPES.map((a) => (
                  <option key={a} value={a}>{ANIMATION_LABELS[a]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
