import { useOverlayAnimation } from "./utils";
import { getOverlayDefinition, type Overlay, type BaseOverlay } from "@/overlays/registry";

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
  const { opacity, transform } = useOverlayAnimation(
    overlay.enterAnimation || "fade",
    overlay.exitAnimation || "none",
    durationInFrames
  );

  const definition = getOverlayDefinition(overlay.type);
  if (!definition) return null;

  const isTextType = overlay.type === "text";
  const isTypingText = overlay.type === "typing-text";

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    width: `${overlay.w}%`,
    height: `${overlay.h}%`,
    opacity,
    transform,
    overflow: "hidden",
    ...(overlay.glass ? glassStyle : {}),
    // Text overlay needs flex centering
    ...(isTextType ? { display: "flex", alignItems: "center", justifyContent: "center" } : {}),
    // Typing text needs transparent background (has its own window chrome)
    ...(isTypingText ? { background: "transparent", border: "none", backdropFilter: "none" } : {}),
  };

  return (
    <div style={baseStyle}>
      {definition.render({ overlay: overlay as BaseOverlay, durationInFrames })}
    </div>
  );
}
