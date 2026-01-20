import { getOverlayDefinition, type Overlay } from "@/overlays";

interface Props {
  overlay: Overlay;
}

export function OverlayItem({ overlay }: Props): React.ReactNode {
  const definition = getOverlayDefinition(overlay.type);
  if (!definition) return null;

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    width: `${overlay.w}%`,
    height: `${overlay.h}%`,
    overflow: "hidden",
  };

  const contentStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={baseStyle}>
      <div style={contentStyle}>
        {definition.render({ overlay })}
      </div>
    </div>
  );
}
