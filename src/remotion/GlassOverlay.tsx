import { useCurrentFrame, interpolate, Img } from "remotion";
import { CSSProperties } from "react";

type Position = "bottom-left" | "bottom-right" | "center";

interface GlassOverlayProps {
  text?: string;
  imageSrc?: string;
  position?: Position;
}

const positionStyles: Record<Position, CSSProperties> = {
  "bottom-left": {
    bottom: 40,
    left: 40,
  },
  "bottom-right": {
    bottom: 40,
    right: 40,
  },
  center: {
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
};

export const GlassOverlay: React.FC<GlassOverlayProps> = ({
  text,
  imageSrc,
  position = "bottom-left",
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const scale = interpolate(frame, [0, 20], [0.95, 1], {
    extrapolateRight: "clamp",
  });

  if (!text && !imageSrc) return null;

  const glassStyle: CSSProperties = {
    position: "absolute",
    ...positionStyles[position],
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    padding: "16px 24px",
    opacity,
    transform:
      position === "center"
        ? `translate(-50%, -50%) scale(${scale})`
        : `scale(${scale})`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    maxWidth: 400,
  };

  const textStyle: CSSProperties = {
    color: "white",
    fontSize: 18,
    fontWeight: 500,
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
    margin: 0,
    textAlign: "center",
    lineHeight: 1.4,
  };

  return (
    <div style={glassStyle}>
      {imageSrc && (
        <Img
          src={imageSrc}
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            objectFit: "cover",
          }}
        />
      )}
      {text && <p style={textStyle}>{text}</p>}
    </div>
  );
};
