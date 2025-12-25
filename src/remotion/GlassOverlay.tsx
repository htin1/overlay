import { useCurrentFrame, interpolate, Img } from "remotion";

interface Props {
  text?: string;
  imageSrc?: string;
  imageSize?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function GlassOverlay({ text, imageSrc, imageSize = 64, x = 5, y = 70, width = 25, height = 15 }: Props) {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });

  if (!text && !imageSrc) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        minHeight: `${height}%`,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        background: "rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        padding: "16px 24px",
        opacity,
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      {imageSrc && (
        <Img
          src={imageSrc}
          style={{ width: imageSize, height: imageSize, borderRadius: 12, objectFit: "cover" }}
        />
      )}
      {text && (
        <p
          style={{
            color: "white",
            fontSize: 24,
            fontWeight: 500,
            textShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          {text}
        </p>
      )}
    </div>
  );
}
