import { Img, OffthreadVideo } from "remotion";
import { isVideo } from "../lib/utils";
import { useOverlayOpacity } from "./utils";

interface Props {
  mediaSrc?: string;
  mediaX?: number;
  mediaY?: number;
  mediaW?: number;
  mediaH?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function GlassOverlay({
  mediaSrc,
  mediaX = 10,
  mediaY = 10,
  mediaW = 80,
  mediaH = 80,
  x = 5,
  y = 70,
  width = 25,
  height = 15,
}: Props) {
  const opacity = useOverlayOpacity();

  if (!mediaSrc) return null;

  const mediaStyle = {
    position: "absolute" as const,
    left: `${mediaX}%`,
    top: `${mediaY}%`,
    width: `${mediaW}%`,
    height: `${mediaH}%`,
    borderRadius: 12,
    objectFit: "cover" as const,
  };

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        height: `${height}%`,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        background: "rgba(255, 255, 255, 0.15)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        opacity,
        overflow: "hidden",
      }}
    >
      {isVideo(mediaSrc) ? (
        <OffthreadVideo src={mediaSrc} style={mediaStyle} />
      ) : (
        <Img src={mediaSrc} style={mediaStyle} />
      )}
    </div>
  );
}
