"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Plus, Eye, EyeOff, GripVertical, Upload, Link, X, Film, Image, Layers, Trash2 } from "lucide-react";
import { useOverlayContext } from "@/contexts/OverlayContext";
import { OVERLAY_COLORS } from "@/lib/constants";
import type { Overlay } from "@/overlays";

// Re-export MediaItem type for backwards compatibility
export type { MediaItem } from "@/hooks/useMediaManager";

function getOverlayLabel(overlay: Overlay): string {
  return overlay.prompt?.slice(0, 20) || "New layer";
}

function getMediaType(url: string): "image" | "video" {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  if (["mp4", "webm", "mov", "avi"].includes(ext)) return "video";
  return "image";
}

function getFileName(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || "media";
  } catch {
    return url.slice(0, 20);
  }
}

export function LeftPanel() {
  const {
    overlays,
    selectedId,
    setSelectedId,
    toggleVisibility,
    removeOverlay,
    addOverlay,
    reorderOverlays,
    media,
    addMedia,
    removeMedia,
  } = useOverlayContext();

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      addMedia({
        id: crypto.randomUUID(),
        name: file.name || "media",
        url,
        type: file.type.startsWith("video/") ? "video" : "image",
      });
    } catch (err) {
      console.error("Upload error:", err);
    }
  }, [addMedia]);

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    addMedia({
      id: crypto.randomUUID(),
      name: getFileName(url),
      url,
      type: getMediaType(url),
    });
    setUrlInput("");
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (files) Array.from(files).forEach(uploadFile);
  }, [uploadFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      const file = item.getAsFile();
      if (file) uploadFile(file);
    }
  }, [uploadFile]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) setDragOverId(id);
  };

  const handleLayerDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;
    const draggedIndex = overlays.findIndex((o) => o.id === draggedId);
    const targetIndex = overlays.findIndex((o) => o.id === targetId);
    const newOverlays = [...overlays];
    const [removed] = newOverlays.splice(draggedIndex, 1);
    newOverlays.splice(targetIndex, 0, removed);
    reorderOverlays(newOverlays);
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div className="w-72 border-r border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
      {/* Layers Section */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-200 dark:border-white/5">
        <div className="h-10 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-3 shrink-0">
          <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
            <Layers size={12} />
            Layers
            <span className="text-zinc-400">({overlays.length})</span>
          </span>
          <button
            onClick={addOverlay}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 p-1 rounded-lg transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {overlays.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-zinc-400 text-sm mb-2">No layers yet</p>
              <button
                onClick={addOverlay}
                className="text-xs text-forest-500 hover:text-forest-400"
              >
                + Create your first layer
              </button>
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
                    draggable
                    onDragStart={(e) => handleDragStart(e, overlay.id)}
                    onDragOver={(e) => handleDragOver(e, overlay.id)}
                    onDragLeave={() => setDragOverId(null)}
                    onDrop={(e) => handleLayerDrop(e, overlay.id)}
                    onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                    className={`group flex items-center gap-1.5 px-2 py-2 cursor-pointer transition-colors ${
                      isSelected ? "bg-zinc-200 dark:bg-white/10" : "hover:bg-zinc-100 dark:hover:bg-white/5"
                    } ${draggedId === overlay.id ? "opacity-50" : ""} ${dragOverId === overlay.id ? "border-t-2 border-forest-500" : ""}`}
                    onClick={() => setSelectedId(overlay.id)}
                  >
                    <div className="cursor-grab active:cursor-grabbing text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400">
                      <GripVertical size={14} />
                    </div>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${colors?.dot || "bg-forest-500"}`} />
                    <span className={`text-sm truncate flex-1 ${isVisible ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-600 line-through"}`}>
                      {getOverlayLabel(overlay)}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleVisibility(overlay.id); }}
                        className={`p-1 rounded transition-colors ${isVisible ? "text-zinc-400 hover:text-zinc-900 dark:hover:text-white" : "text-zinc-300 dark:text-zinc-600 hover:text-zinc-500"}`}
                        title={isVisible ? "Hide" : "Show"}
                      >
                        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeOverlay(overlay.id); }}
                        className="p-1 rounded transition-colors text-zinc-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Media Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-10 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-3 shrink-0">
          <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
            <Image size={12} />
            Media
            <span className="text-zinc-400">({media.length})</span>
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 p-1 rounded-lg transition-all"
          >
            <Plus size={14} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={handleDrop}
        >
          {media.length === 0 ? (
            <div
              className={`m-2 p-3 border-2 border-dashed rounded-lg text-center transition-colors ${
                isDraggingFile
                  ? "border-forest-500 bg-forest-500/10"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <Upload size={16} className="mx-auto mb-1.5 text-zinc-400" />
              <p className="text-xs text-zinc-500 mb-0.5">Drop files here</p>
              <p className="text-[10px] text-zinc-400 mb-2">or paste from clipboard</p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-forest-500 hover:text-forest-400 mb-2 block mx-auto"
              >
                Browse files
              </button>

              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-1">
                <form onSubmit={handleAddUrl}>
                  <div className="flex gap-1.5">
                    <div className="flex-1 relative">
                      <Link size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="Paste URL..."
                        className="w-full pl-6 pr-2 py-1.5 text-[11px] bg-zinc-100 dark:bg-zinc-800 rounded border-0 focus:ring-1 focus:ring-forest-500 outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!urlInput.trim()}
                      className="px-2 py-1.5 bg-forest-500 hover:bg-forest-600 disabled:opacity-30 text-white rounded transition-colors text-[11px]"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {media.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 group"
                >
                  <div className="w-10 h-10 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.type === "video" ? (
                      <Film size={16} className="text-zinc-400" />
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{item.name}</p>
                    <p className="text-[10px] text-zinc-400 uppercase">{item.type}</p>
                  </div>
                  <button
                    onClick={() => removeMedia(item.id)}
                    className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-2 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-400 hover:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                + Add more
              </button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
        </div>
      </div>
    </div>
  );
}
