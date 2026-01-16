"use client";

import { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Images } from "lucide-react";
import type { MediaItem } from "@/types/media";

interface Props {
  media: MediaItem[];
  query: string;
  onSelect: (media: MediaItem | "all") => void;
  onClose: () => void;
}

export function MediaAutocomplete({ media, query, onSelect, onClose }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Show "all" option only when there are multiple images and query matches
  const showAllOption = media.length > 1 && "all".includes(query.toLowerCase());
  const totalItems = showAllOption ? media.length + 1 : media.length;

  // Reset selection when media list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [media.length, query]);

  // Scroll selected item into view
  useEffect(() => {
    itemRefs.current[selectedIndex]?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex]);

  // Use ref to store latest callback to avoid effect re-running
  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  onSelectRef.current = onSelect;
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((i) => Math.min(i + 1, totalItems - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
        case "Tab":
          e.preventDefault();
          e.stopPropagation();
          if (showAllOption && selectedIndex === 0) {
            onSelectRef.current("all");
          } else {
            const mediaIndex = showAllOption ? selectedIndex - 1 : selectedIndex;
            if (media[mediaIndex]) {
              onSelectRef.current(media[mediaIndex]);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onCloseRef.current();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [totalItems, showAllOption, selectedIndex, media]);

  if (media.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="z-50 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg overflow-hidden min-w-[200px] max-w-[280px]"
    >
      <div className="px-2 py-1.5 border-b border-zinc-200 dark:border-zinc-700">
        <p className="text-[10px] text-zinc-500 flex items-center gap-1">
          <ImageIcon size={10} />
          Images {query && <span className="text-zinc-400">matching &ldquo;{query}&rdquo;</span>}
        </p>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {/* @all option */}
        {showAllOption && (
          <button
            ref={(el) => { itemRefs.current[0] = el; }}
            onClick={() => onSelect("all")}
            className={`w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors ${
              selectedIndex === 0
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Images size={16} className="text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium">@all</span>
              <span className="text-[10px] text-zinc-400">Add all {media.length} images</span>
            </div>
          </button>
        )}
        {/* Individual media items */}
        {media.map((item, index) => {
          const itemIndex = showAllOption ? index + 1 : index;
          return (
            <button
              key={item.id}
              ref={(el) => { itemRefs.current[itemIndex] = el; }}
              onClick={() => onSelect(item)}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-left transition-colors ${
                itemIndex === selectedIndex
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              <img
                src={item.url}
                alt={item.name}
                className="w-8 h-8 rounded object-cover flex-shrink-0 border border-zinc-300 dark:border-zinc-600"
              />
              <span className="text-[11px] truncate">{item.name}</span>
            </button>
          );
        })}
      </div>
      <div className="px-2 py-1 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
        <p className="text-[9px] text-zinc-400">
          <kbd className="px-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">↑↓</kbd> navigate{" "}
          <kbd className="px-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">Enter</kbd> select{" "}
          <kbd className="px-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-[9px]">Esc</kbd> close
        </p>
      </div>
    </div>
  );
}
