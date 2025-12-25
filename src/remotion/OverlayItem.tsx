import { Img, OffthreadVideo } from "remotion";
import { useOverlayAnimation } from "./utils";
import type { Overlay, MediaOverlayData, TextOverlayData } from "./Composition";

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
  };

  // For image/video with glass: position media inside the glass container
  // Without glass: media fills the entire overlay
  const getMediaStyle = (o: MediaOverlayData): React.CSSProperties => {
    if (o.glass) {
      return {
        position: "absolute",
        left: `${o.mediaX}%`,
        top: `${o.mediaY}%`,
        width: `${o.mediaW}%`,
        height: `${o.mediaH}%`,
        objectFit: "cover",
        borderRadius: 12,
      };
    }
    return {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    };
  };

  if (overlay.type === "image") {
    return (
      <div style={baseStyle}>
        {overlay.src && <Img src={overlay.src} style={getMediaStyle(overlay)} />}
      </div>
    );
  }

  if (overlay.type === "video") {
    return (
      <div style={baseStyle}>
        {overlay.src && <OffthreadVideo src={overlay.src} style={getMediaStyle(overlay)} />}
      </div>
    );
  }

  // Text overlay
  const text = overlay as TextOverlayData;
  return (
    <div style={{ ...baseStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p
        style={{
          color: "white",
          fontSize: text.fontSize,
          fontFamily: text.fontFamily,
          fontWeight: 600,
          textShadow: text.glass ? "none" : "0 2px 8px rgba(0, 0, 0, 0.5)",
          margin: 0,
          lineHeight: 1.2,
          padding: text.glass ? 16 : 0,
        }}
      >
        {text.text}
      </p>
    </div>
  );
}
