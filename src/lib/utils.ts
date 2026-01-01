import { overlayRegistry } from "@/lib/overlays/registry"

// Re-export cn for backwards compatibility
export { cn } from "./cn"

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

// Factory functions - delegate to registry
export const createImage = overlayRegistry.image.create;
export const createVideo = overlayRegistry.video.create;
export const createText = overlayRegistry.text.create;
export const createTypingText = overlayRegistry["typing-text"].create;
export const createNotification = overlayRegistry.notification.create;
export const createChat = overlayRegistry.chat.create;

