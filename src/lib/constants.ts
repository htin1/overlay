export const TOTAL_FRAMES = 900;
export const FPS = 30;

// Timeline configuration
export const TIMELINE_CONFIG = {
  BASE_PIXELS_PER_FRAME: 1,
  MIN_ZOOM: 0.5,
  MAX_ZOOM: 4,
  MIN_CLIP_DURATION: 10,
  TRACK_LABEL_WIDTH: 96,
} as const;

// Overlay type colors - used in timeline
export const OVERLAY_COLORS = {
  code: {
    dot: "bg-indigo-500",
    clip: "bg-indigo-500/40 border-indigo-500/60 hover:bg-indigo-500/50",
  },
} as const;

