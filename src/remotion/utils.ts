import { useCurrentFrame, interpolate } from "remotion";

export function useOverlayOpacity() {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
}

