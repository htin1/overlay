import type { AnimationType } from "@/lib/overlays/base";

export const TOTAL_FRAMES = 900;
export const FPS = 30;
export const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
export const FONTS = ["Inter", "Open Sans", "JetBrains Mono", "Arial", "Georgia", "Courier New", "Impact"];

// Timeline configuration
export const TIMELINE_CONFIG = {
  BASE_PIXELS_PER_FRAME: 1,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 4,
  MIN_CLIP_DURATION: 10,
  TRACK_LABEL_WIDTH: 96,
} as const;

// Animation display labels
export const ANIMATION_LABELS: Record<AnimationType, string> = {
  none: "None",
  fade: "Fade",
  slideUp: "Slide Up",
  slideDown: "Slide Down",
  slideLeft: "Slide Left",
  slideRight: "Slide Right",
  scale: "Scale",
  pop: "Pop",
  wipeLeft: "Wipe Left",
  wipeRight: "Wipe Right",
  wipeUp: "Wipe Up",
  wipeDown: "Wipe Down",
  zoom: "Zoom",
  flip: "Flip",
  rotate: "Rotate",
  bounce: "Bounce",
};

// Overlay type colors - used in timeline
export const OVERLAY_COLORS = {
  image: {
    dot: "bg-purple-500",
    clip: "bg-purple-500/40 border-purple-500/60 hover:bg-purple-500/50",
  },
  video: {
    dot: "bg-blue-500",
    clip: "bg-blue-500/40 border-blue-500/60 hover:bg-blue-500/50",
  },
  text: {
    dot: "bg-amber-500",
    clip: "bg-amber-500/40 border-amber-500/60 hover:bg-amber-500/50",
  },
  "typing-text": {
    dot: "bg-emerald-500",
    clip: "bg-emerald-500/40 border-emerald-500/60 hover:bg-emerald-500/50",
  },
  notification: {
    dot: "bg-pink-500",
    clip: "bg-pink-500/40 border-pink-500/60 hover:bg-pink-500/50",
  },
  chat: {
    dot: "bg-cyan-500",
    clip: "bg-cyan-500/40 border-cyan-500/60 hover:bg-cyan-500/50",
  },
} as const;

