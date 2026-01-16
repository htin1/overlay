"use client";

import { useState, useCallback } from "react";
import { type Overlay, codeOverlay } from "@/overlays";
import { useHistory } from "./useHistory";

export function useOverlayManager(initialOverlay?: Overlay) {
  const defaultOverlay = initialOverlay ?? codeOverlay.create({ prompt: "" });
  const { state: overlays, set: setOverlays, undo, redo, canUndo, canRedo } = useHistory<Overlay[]>([defaultOverlay]);
  const [selectedId, setSelectedId] = useState<string | null>(defaultOverlay.id);

  const selected = overlays.find((o) => o.id === selectedId) ?? null;
  const visibleOverlays = overlays.filter((o) => o.visible !== false);

  const update = useCallback((id: string, data: Partial<Overlay>) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, ...data } : o))), [setOverlays]);

  const updateTiming = useCallback((id: string, startFrame: number, endFrame: number) =>
    setOverlays((prev) => prev.map((o) => (o.id === id ? { ...o, startFrame, endFrame } : o))), [setOverlays]);

  const remove = useCallback((id: string) => {
    setOverlays((prev) => prev.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  }, [setOverlays, selectedId]);

  const add = useCallback(() => {
    const layer = codeOverlay.create({ prompt: "" });
    setOverlays((prev) => [...prev, layer]);
    setSelectedId(layer.id);
  }, [setOverlays]);

  const toggleVisibility = useCallback((id: string) => {
    setOverlays((prev) => prev.map((o) =>
      o.id === id ? { ...o, visible: !o.visible } : o
    ));
  }, [setOverlays]);

  const reorder = setOverlays;

  return {
    overlays,
    selectedId,
    selected,
    visibleOverlays,
    setSelectedId,
    update,
    updateTiming,
    remove,
    add,
    toggleVisibility,
    reorder,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
