"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Eye, EyeOff, ImageIcon, Type, ChevronDown } from "lucide-react";
import type { Overlay, TextOverlayData } from "@/overlays/registry";
import { OVERLAY_COLORS } from "@/lib/constants";

interface Props {
  overlays: Overlay[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onAddOverlay: (type: "media" | "text") => void;
}

const btnIcon = "text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 p-1.5 rounded-lg cursor-pointer transition-all";

function getOverlayLabel(overlay: Overlay): string {
  switch (overlay.type) {
    case "text":
      return (overlay as TextOverlayData).text?.slice(0, 16) || "Text";
    case "media":
      return "Media";
    case "typing-text":
      return "Typing Text";
    case "notification":
      return "Notification";
    case "chat":
      return "Chat";
    default:
      return "Layer";
  }
}

export function LeftPanel({
  overlays,
  selectedId,
  onSelect,
  onToggleVisibility,
  onAddOverlay,
}: Props) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-56 border-r border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-12 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-4 shrink-0">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">Layers</span>
        <div className="relative" ref={addMenuRef}>
          <button
            onClick={() => setAddMenuOpen(!addMenuOpen)}
            className={`${btnIcon} flex items-center gap-1`}
            title="Add layer"
          >
            <Plus size={14} />
            <span className="text-xs">Add</span>
            <ChevronDown size={12} />
          </button>
          {addMenuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg py-1 min-w-[100px] shadow-lg z-50">
              <button
                onClick={() => { onAddOverlay("media"); setAddMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <ImageIcon size={12} /> Media
              </button>
              <button
                onClick={() => { onAddOverlay("text"); setAddMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Type size={12} /> Text
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto">
        {overlays.length === 0 ? (
          <div className="p-4 text-center text-zinc-400 text-sm">
            No layers yet
          </div>
        ) : (
          <div className="py-1">
            {overlays.map((overlay) => {
              const colors = OVERLAY_COLORS[overlay.type as keyof typeof OVERLAY_COLORS];
              const isVisible = overlay.visible !== false;
              const isSelected = selectedId === overlay.id;

              return (
                <div
                  key={overlay.id}
                  className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                    isSelected ? "bg-zinc-200 dark:bg-white/10" : "hover:bg-zinc-100 dark:hover:bg-white/5"
                  }`}
                  onClick={() => onSelect(overlay.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(overlay.id);
                    }}
                    className={`p-1 rounded transition-colors ${
                      isVisible ? "text-zinc-500 hover:text-zinc-900 dark:hover:text-white" : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-500"
                    }`}
                  >
                    {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <div className={`w-2 h-2 rounded-full ${colors?.dot || "bg-zinc-400"}`} />
                  <span className={`text-sm truncate flex-1 ${isVisible ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600"}`}>
                    {getOverlayLabel(overlay)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
