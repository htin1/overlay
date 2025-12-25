import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { MediaOverlayData, TextOverlayData } from "@/remotion/Composition"
import { TOTAL_FRAMES } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format seconds to M:SS
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Convert click position to frame
export function clickToFrame(e: React.MouseEvent, pixelsPerFrame: number, totalFrames: number): number {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  return Math.max(0, Math.min(totalFrames - 1, Math.round(x / pixelsPerFrame)));
}

// Create default media overlay (image or video)
export function createMedia(type: "image" | "video"): MediaOverlayData {
  return {
    id: crypto.randomUUID(),
    type,
    src: "",
    x: 5, y: 60, w: 20, h: 25,
    mediaX: 10, mediaY: 10, mediaW: 80, mediaH: 80,
    startFrame: 0,
    endFrame: TOTAL_FRAMES,
    enterAnimation: "fade",
    exitAnimation: "none",
    glass: false,
  };
}

// Convenience aliases
export const createImage = () => createMedia("image");
export const createVideo = () => createMedia("video");

// Create default text overlay
export function createText(): TextOverlayData {
  return {
    id: crypto.randomUUID(),
    type: "text",
    text: "Your text",
    fontSize: 48,
    fontFamily: "Open Sans",
    x: 5, y: 50, w: 50, h: 10,
    startFrame: 0,
    endFrame: TOTAL_FRAMES,
    enterAnimation: "fade",
    exitAnimation: "none",
    glass: false,
  };
}
