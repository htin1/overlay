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

// Factory functions - lazy import to avoid circular dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getRegistry = () => require("@/overlays/registry").overlayRegistry as any;

export const createMedia = (overrides?: Record<string, unknown>) => getRegistry().media.create(overrides);
export const createText = (overrides?: Record<string, unknown>) => getRegistry().text.create(overrides);
export const createTypingText = (overrides?: Record<string, unknown>) => getRegistry()["typing-text"].create(overrides);
export const createNotification = (overrides?: Record<string, unknown>) => getRegistry().notification.create(overrides);
export const createChat = (overrides?: Record<string, unknown>) => getRegistry().chat.create(overrides);

