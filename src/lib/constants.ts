import type { AnimationType } from "@/overlays/base";

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

// Overlay type colors - used in side panel and timeline
export const OVERLAY_COLORS = {
  image: {
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    card: "bg-purple-500/10 border-purple-500/30",
    cardSelected: "bg-purple-500/20 border-purple-500/50",
    dot: "bg-purple-500",
    clip: "bg-purple-500/40 border-purple-500/60 hover:bg-purple-500/50",
  },
  video: {
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    card: "bg-blue-500/10 border-blue-500/30",
    cardSelected: "bg-blue-500/20 border-blue-500/50",
    dot: "bg-blue-500",
    clip: "bg-blue-500/40 border-blue-500/60 hover:bg-blue-500/50",
  },
  text: {
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    card: "bg-amber-500/10 border-amber-500/30",
    cardSelected: "bg-amber-500/20 border-amber-500/50",
    dot: "bg-amber-500",
    clip: "bg-amber-500/40 border-amber-500/60 hover:bg-amber-500/50",
  },
  "typing-text": {
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    card: "bg-emerald-500/10 border-emerald-500/30",
    cardSelected: "bg-emerald-500/20 border-emerald-500/50",
    dot: "bg-emerald-500",
    clip: "bg-emerald-500/40 border-emerald-500/60 hover:bg-emerald-500/50",
  },
  notification: {
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/30",
    card: "bg-pink-500/10 border-pink-500/30",
    cardSelected: "bg-pink-500/20 border-pink-500/50",
    dot: "bg-pink-500",
    clip: "bg-pink-500/40 border-pink-500/60 hover:bg-pink-500/50",
  },
  chat: {
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    card: "bg-cyan-500/10 border-cyan-500/30",
    cardSelected: "bg-cyan-500/20 border-cyan-500/50",
    dot: "bg-cyan-500",
    clip: "bg-cyan-500/40 border-cyan-500/60 hover:bg-cyan-500/50",
  },
} as const;

