import { Composition, registerRoot } from "remotion";
import { VideoComposition } from "./Composition";
import { TOTAL_FRAMES, FPS } from "@/lib/constants";

const RemotionRoot = () => {
  return (
    <Composition
      id="Video"
      component={VideoComposition}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
      defaultProps={{
        videoSrc: undefined,
        overlays: [],
      }}
    />
  );
};

registerRoot(RemotionRoot);
