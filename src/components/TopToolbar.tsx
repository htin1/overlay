"use client";

import { useState, useRef, useEffect } from "react";
import { Undo2, Redo2, Download, Loader2, ChevronDown, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  onExport: () => void;
  exportStatus: { active: boolean; message: string; progress?: number };
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const btnIcon = "text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 p-2 rounded-lg cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400";

export function TopToolbar({
  onExport,
  exportStatus,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: Props) {
  const { theme, toggleTheme } = useTheme();
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="h-12 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-4 bg-zinc-50 dark:bg-zinc-900/50">
      {/* Left: Undo/Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={btnIcon}
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={btnIcon}
          title="Redo"
        >
          <Redo2 size={16} />
        </button>
      </div>

      {/* Center: Title */}
      <span className="text-sm text-zinc-400">Overlay Editor</span>

      {/* Right: Theme toggle + Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className={btnIcon}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            disabled={exportStatus.active}
            className={`${btnIcon} flex items-center gap-1`}
            title="Export"
          >
            {exportStatus.active ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            <span className="text-sm">Export</span>
            <ChevronDown size={12} />
          </button>
          {exportMenuOpen && !exportStatus.active && (
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg py-1 min-w-[140px] shadow-lg z-50">
              <button
                onClick={() => { onExport(); setExportMenuOpen(false); }}
                className="w-full px-3 py-1.5 text-left text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
              >
                Export MP4
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
