"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Eye, EyeOff, ImageIcon, Type, ChevronDown, GripVertical } from "lucide-react";
import type { Overlay, TextOverlayData } from "@/overlays/registry";
import { OVERLAY_COLORS } from "@/lib/constants";

interface Props {
  overlays: Overlay[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onAddOverlay: (type: "media" | "text") => void;
  onReorder: (overlays: Overlay[]) => void;
}

const btnIcon = "text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 p-1.5 rounded-lg cursor-pointer transition-all";

function getOverlayLabel(overlay: Overlay): string {
  if (overlay.type === "text") {
    return (overlay as TextOverlayData).text?.slice(0, 16) || "Text";
  }
  return overlay.type.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export function LeftPanel({
  overlays,
  selectedId,
  onSelect,
  onToggleVisibility,
  onAddOverlay,
  onReorder,
}: Props) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
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

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = overlays.findIndex((o) => o.id === draggedId);
    const targetIndex = overlays.findIndex((o) => o.id === targetId);

    const newOverlays = [...overlays];
    const [removed] = newOverlays.splice(draggedIndex, 1);
    newOverlays.splice(targetIndex, 0, removed);

    onReorder(newOverlays);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

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
              const isDragging = draggedId === overlay.id;
              const isDragOver = dragOverId === overlay.id;

              return (
                <div
                  key={overlay.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, overlay.id)}
                  onDragOver={(e) => handleDragOver(e, overlay.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, overlay.id)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-1 px-2 py-2 cursor-pointer transition-colors ${
                    isSelected ? "bg-zinc-200 dark:bg-white/10" : "hover:bg-zinc-100 dark:hover:bg-white/5"
                  } ${isDragging ? "opacity-50" : ""} ${isDragOver ? "border-t-2 border-blue-500" : ""}`}
                  onClick={() => onSelect(overlay.id)}
                >
                  <div className="cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400">
                    <GripVertical size={14} />
                  </div>
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
