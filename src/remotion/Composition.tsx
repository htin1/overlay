import { AbsoluteFill, Video, Sequence } from "remotion";
import { OverlayItem } from "./OverlayItem";

export const ANIMATION_TYPES = [
  "none",
  "fade",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
  "scale",
  "pop",
  // Slide deck style
  "wipeLeft",
  "wipeRight",
  "wipeUp",
  "wipeDown",
  "zoom",
  "flip",
  "rotate",
  "bounce",
] as const;

export type AnimationType = (typeof ANIMATION_TYPES)[number];

interface BaseOverlay {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  endFrame: number;
  enterAnimation?: AnimationType;
  exitAnimation?: AnimationType;
  glass?: boolean;
}

// Image and Video share the same structure
export interface MediaOverlayData extends BaseOverlay {
  type: "image" | "video";
  src: string;
  // Media position within glass (% values)
  mediaX: number;
  mediaY: number;
  mediaW: number;
  mediaH: number;
}

export interface TextOverlayData extends BaseOverlay {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
}

export type Overlay = MediaOverlayData | TextOverlayData;

// Type guards for convenience
export const isMediaOverlay = (o: Overlay): o is MediaOverlayData => o.type === "image" || o.type === "video";
export const isTextOverlay = (o: Overlay): o is TextOverlayData => o.type === "text";

export interface CompositionProps {
  videoSrc?: string;
  overlays?: Overlay[];
}

export function VideoComposition({ videoSrc, overlays = [] }: CompositionProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {videoSrc && (
        <Video src={videoSrc} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      )}
      {overlays.map((overlay) => {
        const duration = overlay.endFrame - overlay.startFrame;
        return (
          <Sequence
            key={overlay.id}
            from={overlay.startFrame}
            durationInFrames={duration}
          >
            <OverlayItem overlay={overlay} durationInFrames={duration} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
