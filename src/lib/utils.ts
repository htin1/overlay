import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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

// Get file name from URL
export function getFileName(url: string, fallback = "media"): string {
  try {
    const pathname = new URL(url).pathname;
    return pathname.split("/").pop() || fallback;
  } catch {
    return fallback;
  }
}

// Determine media type from URL extension
export function getMediaType(url: string): "image" | "video" {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  if (["mp4", "webm", "mov", "avi"].includes(ext)) return "video";
  return "image";
}

