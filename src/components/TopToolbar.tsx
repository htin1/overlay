"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Image, Film, Type, Download, Loader2, Upload, LayoutTemplate, X } from "lucide-react";
import { TemplateLibrary } from "./TemplateLibrary";
import type { Overlay } from "@/lib/overlays/registry";

interface Props {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  onAddOverlay: (type: "image" | "video" | "text") => void;
  onAddFromTemplate: (overlay: Overlay) => void;
  onExport: () => void;
  exportStatus: { active: boolean; message: string; progress?: number };
}

const btnIcon = "text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-all";

function getDisplayName(url: string): string {
  if (!url) return "No video";
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const filename = path.split("/").pop() || urlObj.hostname;
    return filename.length > 30 ? filename.slice(0, 27) + "..." : filename;
  } catch {
    return url.length > 30 ? url.slice(0, 27) + "..." : url;
  }
}

export function TopToolbar({
  videoUrl,
  onVideoUrlChange,
  onAddOverlay,
  onAddFromTemplate,
  onExport,
  exportStatus,
}: Props) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setAddMenuOpen(false);
      }
      if (templatesRef.current && !templatesRef.current.contains(e.target as Node)) {
        setTemplatesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-900/50">
      {/* Left: Video URL display */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-white/50">{getDisplayName(videoUrl)}</span>
        <label className={btnIcon}>
          <Upload size={14} />
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onVideoUrlChange(URL.createObjectURL(file));
            }}
          />
        </label>
      </div>

      {/* Right: Add + Templates + Export */}
      <div className="flex items-center gap-1">
        <div className="relative" ref={addMenuRef}>
          <button
            onClick={() => setAddMenuOpen(!addMenuOpen)}
            className={btnIcon}
            title="Add overlay"
          >
            <Plus size={16} />
          </button>
          {addMenuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-lg py-1 min-w-[100px] shadow-xl z-50">
              <button
                onClick={() => { onAddOverlay("image"); setAddMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Image size={12} /> Image
              </button>
              <button
                onClick={() => { onAddOverlay("video"); setAddMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Film size={12} /> Video
              </button>
              <button
                onClick={() => { onAddOverlay("text"); setAddMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-white/60 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Type size={12} /> Text
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={templatesRef}>
          <button
            onClick={() => setTemplatesOpen(!templatesOpen)}
            className={btnIcon}
            title="Templates"
          >
            <LayoutTemplate size={16} />
          </button>
          {templatesOpen && (
            <div className="absolute right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 w-64 max-h-80 overflow-y-auto">
              <div className="sticky top-0 bg-zinc-900 border-b border-white/5 px-3 py-2 flex items-center justify-between">
                <span className="text-xs text-white/50">Templates</span>
                <button onClick={() => setTemplatesOpen(false)} className="text-white/30 hover:text-white/60">
                  <X size={12} />
                </button>
              </div>
              <div className="p-2">
                <TemplateLibrary onSelect={(o) => { onAddFromTemplate(o); setTemplatesOpen(false); }} />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onExport}
          disabled={exportStatus.active}
          className={btnIcon}
          title="Export"
        >
          {exportStatus.active ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
      </div>
    </div>
  );
}
