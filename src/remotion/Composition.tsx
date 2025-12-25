import { AbsoluteFill, Video } from "remotion";
import { GlassOverlay } from "./GlassOverlay";

export interface CompositionProps {
  videoSrc?: string;
  overlayText?: string;
  overlayImage?: string;
  overlayPosition?: "bottom-left" | "bottom-right" | "center";
}

export const VideoComposition: React.FC<CompositionProps> = ({
  videoSrc = "",
  overlayText,
  overlayImage,
  overlayPosition = "bottom-left",
}) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {videoSrc && (
        <Video
          src={videoSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      <GlassOverlay
        text={overlayText}
        imageSrc={overlayImage}
        position={overlayPosition}
      />
    </AbsoluteFill>
  );
};
