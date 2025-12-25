import { useOverlayAnimation } from "./utils";
import type { AnimationType } from "./Composition";

interface Props {
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  x?: number;
  y?: number;
  width?: number;
  enterAnimation?: AnimationType;
  exitAnimation?: AnimationType;
  durationInFrames?: number;
}

export function TextOverlay({
  text,
  fontSize = 48,
  fontFamily = "Open Sans",
  x = 5,
  y = 70,
  width = 50,
  enterAnimation = "fade",
  exitAnimation = "none",
  durationInFrames = 300,
}: Props) {
  const { opacity, transform } = useOverlayAnimation(enterAnimation, exitAnimation, durationInFrames);

  if (!text) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        opacity,
        transform,
      }}
    >
      <p
        style={{
          color: "white",
          fontSize,
          fontFamily,
          fontWeight: 600,
          textShadow: "0 2px 8px rgba(0, 0, 0, 0.5)",
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {text}
      </p>
    </div>
  );
}
