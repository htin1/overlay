import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { AnimationType } from "./Composition";

const ANIM_DURATION = 20; // frames for enter/exit animations

interface AnimationStyle {
  opacity: number;
  transform: string;
}

function getEnterValue(
  type: AnimationType,
  progress: number,
  springProgress: number,
  bounceProgress: number
): AnimationStyle {
  switch (type) {
    case "fade":
      return { opacity: progress, transform: "none" };
    case "slideUp":
      return { opacity: progress, transform: `translateY(${(1 - progress) * 50}px)` };
    case "slideDown":
      return { opacity: progress, transform: `translateY(${(1 - progress) * -50}px)` };
    case "slideLeft":
      return { opacity: progress, transform: `translateX(${(1 - progress) * 50}px)` };
    case "slideRight":
      return { opacity: progress, transform: `translateX(${(1 - progress) * -50}px)` };
    case "scale":
      return { opacity: progress, transform: `scale(${0.5 + progress * 0.5})` };
    case "pop":
      return { opacity: Math.min(springProgress, 1), transform: `scale(${springProgress})` };
    // Slide deck style - full screen wipes
    case "wipeLeft":
      return { opacity: 1, transform: `translateX(${(1 - progress) * 100}%)` };
    case "wipeRight":
      return { opacity: 1, transform: `translateX(${(1 - progress) * -100}%)` };
    case "wipeUp":
      return { opacity: 1, transform: `translateY(${(1 - progress) * 100}%)` };
    case "wipeDown":
      return { opacity: 1, transform: `translateY(${(1 - progress) * -100}%)` };
    case "zoom":
      return { opacity: progress, transform: `scale(${0.3 + springProgress * 0.7})` };
    case "flip":
      return { opacity: progress, transform: `perspective(1000px) rotateY(${(1 - progress) * 90}deg)` };
    case "rotate":
      return { opacity: progress, transform: `rotate(${(1 - progress) * -180}deg) scale(${progress})` };
    case "bounce":
      return { opacity: 1, transform: `translateY(${(1 - bounceProgress) * 100}%)` };
    default:
      return { opacity: 1, transform: "none" };
  }
}

function getExitValue(
  type: AnimationType,
  progress: number
): AnimationStyle {
  const inv = 1 - progress; // inverse for exit
  switch (type) {
    case "fade":
      return { opacity: inv, transform: "none" };
    case "slideUp":
      return { opacity: inv, transform: `translateY(${progress * -50}px)` };
    case "slideDown":
      return { opacity: inv, transform: `translateY(${progress * 50}px)` };
    case "slideLeft":
      return { opacity: inv, transform: `translateX(${progress * -50}px)` };
    case "slideRight":
      return { opacity: inv, transform: `translateX(${progress * 50}px)` };
    case "scale":
      return { opacity: inv, transform: `scale(${1 - progress * 0.5})` };
    case "pop":
      return { opacity: inv, transform: `scale(${1 - progress * 0.5})` };
    // Slide deck style exits
    case "wipeLeft":
      return { opacity: 1, transform: `translateX(${progress * -100}%)` };
    case "wipeRight":
      return { opacity: 1, transform: `translateX(${progress * 100}%)` };
    case "wipeUp":
      return { opacity: 1, transform: `translateY(${progress * -100}%)` };
    case "wipeDown":
      return { opacity: 1, transform: `translateY(${progress * 100}%)` };
    case "zoom":
      return { opacity: inv, transform: `scale(${1 + progress * 0.5})` };
    case "flip":
      return { opacity: inv, transform: `perspective(1000px) rotateY(${progress * -90}deg)` };
    case "rotate":
      return { opacity: inv, transform: `rotate(${progress * 180}deg) scale(${inv})` };
    case "bounce":
      return { opacity: 1, transform: `translateY(${progress * -100}%)` };
    default:
      return { opacity: 1, transform: "none" };
  }
}

export function useOverlayAnimation(
  enterAnimation: AnimationType = "fade",
  exitAnimation: AnimationType = "none",
  durationInFrames: number
): AnimationStyle {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const exitStart = durationInFrames - ANIM_DURATION;

  // Enter animation
  if (frame < ANIM_DURATION && enterAnimation !== "none") {
    const progress = interpolate(frame, [0, ANIM_DURATION], [0, 1], {
      extrapolateRight: "clamp",
    });
    const springProgress = spring({ frame, fps, config: { damping: 12 } });
    const bounceProgress = spring({ frame, fps, config: { damping: 8, stiffness: 200 } });
    return getEnterValue(enterAnimation, progress, springProgress, bounceProgress);
  }

  // Exit animation
  if (frame >= exitStart && exitAnimation !== "none") {
    const progress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return getExitValue(exitAnimation, progress);
  }

  return { opacity: 1, transform: "none" };
}

// Legacy hook for backwards compatibility
export function useOverlayOpacity() {
  const frame = useCurrentFrame();
  return interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
}

