import { AbsoluteFill, Sequence } from "remotion";
import { OverlayItem } from "./OverlayItem";
import type { Overlay } from "@/overlays";

export interface CompositionProps {
  overlays?: Overlay[];
  backgroundColor?: string;
}

export function VideoComposition({ overlays = [], backgroundColor = "#000000" }: CompositionProps) {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
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
