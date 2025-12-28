import { AbsoluteFill, Video, Sequence } from "remotion";
import { OverlayItem } from "./OverlayItem";
import type { Overlay } from "@/lib/overlays/registry";

export interface CompositionProps {
  videoSrc?: string;
  overlays?: Overlay[];
}

export function VideoComposition({ videoSrc, overlays = [] }: CompositionProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {videoSrc && (
        <Video
          src={videoSrc}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          pauseWhenBuffering
        />
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
