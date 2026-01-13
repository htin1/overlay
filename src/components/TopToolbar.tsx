"use client";

import { Undo2, Redo2, Download, Loader2, Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  onExport: () => void;
  exporting: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const btn = "text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-zinc-400";

export function TopToolbar({ onExport, exporting, canUndo, canRedo, onUndo, onRedo }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-12 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-4 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="flex items-center gap-1">
        <button onClick={onUndo} disabled={!canUndo} className={btn} title="Undo">
          <Undo2 size={16} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className={btn} title="Redo">
          <Redo2 size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={toggleTheme} className={btn} title={theme === "dark" ? "Light mode" : "Dark mode"}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={onExport} disabled={exporting} className={btn} title="Export MP4">
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        </button>
      </div>
    </div>
  );
}
