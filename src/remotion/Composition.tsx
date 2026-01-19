import { AbsoluteFill, Sequence } from "remotion";
import { OverlayItem } from "./OverlayItem";
import type { Overlay } from "@/overlays";

export interface CompositionProps {
  overlays?: Overlay[];
  backgroundColor?: string;
}

export function VideoComposition({ overlays = [], backgroundColor = "transparent" }: CompositionProps): React.ReactNode {
  return (
    <AbsoluteFill style={{ backgroundColor }}>
      {overlays.map((overlay) => (
        <Sequence
          key={overlay.id}
          from={overlay.startFrame}
          durationInFrames={overlay.endFrame - overlay.startFrame}
        >
          <OverlayItem overlay={overlay} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}
