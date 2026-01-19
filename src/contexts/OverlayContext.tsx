"use client";

import { createContext, useContext, ReactNode, useState, useCallback } from "react";
import { useOverlayManager } from "@/hooks/useOverlayManager";
import { useMediaManager, type MediaItem } from "@/hooks/useMediaManager";
import type { Overlay } from "@/overlays";
import type { WebsiteExtraction } from "@/types/website";

interface OverlayContextValue {
  // Overlay state
  overlays: Overlay[];
  selectedId: string | null;
  selected: Overlay | null;
  visibleOverlays: Overlay[];

  // Overlay actions
  setSelectedId: (id: string | null) => void;
  updateOverlay: (id: string, data: Partial<Overlay>) => void;
  updateTiming: (id: string, startFrame: number, endFrame: number) => void;
  removeOverlay: (id: string) => void;
  addOverlay: () => void;
  toggleVisibility: (id: string) => void;
  reorderOverlays: (overlays: Overlay[]) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Media state & actions
  media: MediaItem[];
  addMedia: (item: MediaItem) => void;
  removeMedia: (id: string) => void;

  // Brand assets from website extraction
  brandAssets: WebsiteExtraction | null;
  setBrandAssets: (assets: WebsiteExtraction | null) => void;
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const overlayManager = useOverlayManager();
  const mediaManager = useMediaManager();
  const [brandAssets, setBrandAssetsState] = useState<WebsiteExtraction | null>(null);

  const setBrandAssets = useCallback((assets: WebsiteExtraction | null) => {
    setBrandAssetsState(assets);
  }, []);

  const value: OverlayContextValue = {
    // Overlay state
    overlays: overlayManager.overlays,
    selectedId: overlayManager.selectedId,
    selected: overlayManager.selected,
    visibleOverlays: overlayManager.visibleOverlays,

    // Overlay actions
    setSelectedId: overlayManager.setSelectedId,
    updateOverlay: overlayManager.update,
    updateTiming: overlayManager.updateTiming,
    removeOverlay: overlayManager.remove,
    addOverlay: overlayManager.add,
    toggleVisibility: overlayManager.toggleVisibility,
    reorderOverlays: overlayManager.reorder,

    // History
    undo: overlayManager.undo,
    redo: overlayManager.redo,
    canUndo: overlayManager.canUndo,
    canRedo: overlayManager.canRedo,

    // Media
    media: mediaManager.media,
    addMedia: mediaManager.add,
    removeMedia: mediaManager.remove,

    // Brand assets
    brandAssets,
    setBrandAssets,
  };

  return (
    <OverlayContext.Provider value={value}>
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlayContext() {
  const context = useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlayContext must be used within an OverlayProvider");
  }
  return context;
}
