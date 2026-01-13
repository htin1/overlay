import { getOverlayDefinition, type Overlay } from "@/overlays";

interface Props {
  overlay: Overlay;
  durationInFrames: number;
}

const glassStyle = {
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  background: "rgba(255, 255, 255, 0.15)",
  border: "1px solid rgba(255, 255, 255, 0.25)",
  borderRadius: 16,
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
};

export function OverlayItem({ overlay, durationInFrames }: Props) {
  const definition = getOverlayDefinition(overlay.type);
  if (!definition) return null;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    width: `${overlay.w}%`,
    height: `${overlay.h}%`,
    overflow: "hidden",
    ...(overlay.glass ? glassStyle : {}),
  };

  return (
    <div style={baseStyle}>
      {definition.render({ overlay, durationInFrames })}
    </div>
  );
}
