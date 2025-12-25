import { AbsoluteFill, Video, Sequence } from "remotion";
import { GlassOverlay } from "./GlassOverlay";
import { TextOverlay } from "./TextOverlay";

interface BaseOverlay {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  endFrame: number;
}

export interface GlassOverlayData extends BaseOverlay {
  type: "glass";
  mediaSrc: string;
  mediaX: number; // % within glass
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

export type Overlay = GlassOverlayData | TextOverlayData;

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
        <Sequence
          key={overlay.id}
          from={overlay.startFrame}
          durationInFrames={overlay.endFrame - overlay.startFrame}
        >
          {overlay.type === "glass" ? (
            <GlassOverlay
              mediaSrc={overlay.mediaSrc}
              mediaX={overlay.mediaX}
              mediaY={overlay.mediaY}
              mediaW={overlay.mediaW}
              mediaH={overlay.mediaH}
              x={overlay.x}
              y={overlay.y}
              width={overlay.w}
              height={overlay.h}
            />
          ) : (
            <TextOverlay
              text={overlay.text}
              fontSize={overlay.fontSize}
              fontFamily={overlay.fontFamily}
              x={overlay.x}
              y={overlay.y}
              width={overlay.w}
            />
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
