import type { AnimationType } from "@/remotion/Composition";

export const TOTAL_FRAMES = 900;
export const FPS = 30;
export const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
export const FONTS = ["Open Sans", "Arial", "Georgia", "Courier New", "Impact"];

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

export const ASPECT_RATIOS = {
  "16:9": { width: 1920, height: 1080, label: "16:9 Landscape" },
  "9:16": { width: 1080, height: 1920, label: "9:16 Vertical" },
  "4:3": { width: 1440, height: 1080, label: "4:3 Standard" },
  "1:1": { width: 1080, height: 1080, label: "1:1 Square" },
  "21:9": { width: 2560, height: 1080, label: "21:9 Ultrawide" },
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;

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
} as const;

