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
    dot: "bg-forest-500",
    clip: "bg-forest-500/40 border-forest-500/60 hover:bg-forest-500/50",
  },
} as const;

// AI model configuration
export const AI_MODELS = [
  { id: "gemini-3-flash", label: "Gemini 3 Flash" },
  { id: "gemini-3-pro", label: "Gemini 3 Pro" },
  { id: "sonnet-4.5", label: "Claude Sonnet 4.5" },
  { id: "haiku-4.5", label: "Claude Haiku 4.5" },
  { id: "opus-4.5", label: "Claude Opus 4.5" },
] as const;

export type AIModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_AI_MODEL: AIModelId = "gemini-3-flash";

