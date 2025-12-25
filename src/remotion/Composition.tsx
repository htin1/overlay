import { AbsoluteFill, Video } from "remotion";
import { GlassOverlay } from "./GlassOverlay";

export interface Overlay {
  id: string;
  text: string;
  image: string;
  imageSize: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CompositionProps {
  videoSrc?: string;
  overlays?: Overlay[];
}

export function VideoComposition({ videoSrc, overlays = [] }: CompositionProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {videoSrc && (
        <Video src={videoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {overlays.map((overlay) => (
        <GlassOverlay
          key={overlay.id}
          text={overlay.text}
          imageSrc={overlay.image}
          imageSize={overlay.imageSize}
          x={overlay.x}
          y={overlay.y}
          width={overlay.w}
          height={overlay.h}
        />
      ))}
    </AbsoluteFill>
  );
}
