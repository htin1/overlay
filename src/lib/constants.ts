export const TOTAL_FRAMES = 900;
export const FPS = 30;
export const SAMPLE_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
export const FONTS = ["Open Sans", "Arial", "Georgia", "Courier New", "Impact"];

export const ASPECT_RATIOS = {
  "16:9": { width: 1920, height: 1080, label: "16:9 Landscape" },
  "9:16": { width: 1080, height: 1920, label: "9:16 Vertical" },
  "4:3": { width: 1440, height: 1080, label: "4:3 Standard" },
  "1:1": { width: 1080, height: 1080, label: "1:1 Square" },
  "21:9": { width: 2560, height: 1080, label: "21:9 Ultrawide" },
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;

