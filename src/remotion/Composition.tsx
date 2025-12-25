import { AbsoluteFill, Video } from "remotion";
import { GlassOverlay } from "./GlassOverlay";

export interface CompositionProps {
  videoSrc?: string;
  text?: string;
  image?: string;
  imageSize?: number;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

export function VideoComposition({ videoSrc, text, image, imageSize, x, y, w, h }: CompositionProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {videoSrc && (
        <Video src={videoSrc} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      <GlassOverlay text={text} imageSrc={image} imageSize={imageSize} x={x} y={y} width={w} height={h} />
    </AbsoluteFill>
  );
}
