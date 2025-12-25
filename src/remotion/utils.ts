import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { AnimationType } from "./Composition";

const ANIM_DURATION = 20;

interface AnimationStyle {
  opacity: number;
  transform: string;
}

type AnimationFn = (progress: number, springProgress: number, bounceProgress: number) => AnimationStyle;

// Enter animation lookup table
const enterAnimations: Record<AnimationType, AnimationFn> = {
  none: () => ({ opacity: 1, transform: "none" }),
  fade: (p) => ({ opacity: p, transform: "none" }),
  slideUp: (p) => ({ opacity: p, transform: `translateY(${(1 - p) * 50}px)` }),
  slideDown: (p) => ({ opacity: p, transform: `translateY(${(1 - p) * -50}px)` }),
  slideLeft: (p) => ({ opacity: p, transform: `translateX(${(1 - p) * 50}px)` }),
  slideRight: (p) => ({ opacity: p, transform: `translateX(${(1 - p) * -50}px)` }),
  scale: (p) => ({ opacity: p, transform: `scale(${0.5 + p * 0.5})` }),
  pop: (_, sp) => ({ opacity: Math.min(sp, 1), transform: `scale(${sp})` }),
  wipeLeft: (p) => ({ opacity: 1, transform: `translateX(${(1 - p) * 100}%)` }),
  wipeRight: (p) => ({ opacity: 1, transform: `translateX(${(1 - p) * -100}%)` }),
  wipeUp: (p) => ({ opacity: 1, transform: `translateY(${(1 - p) * 100}%)` }),
  wipeDown: (p) => ({ opacity: 1, transform: `translateY(${(1 - p) * -100}%)` }),
  zoom: (p, sp) => ({ opacity: p, transform: `scale(${0.3 + sp * 0.7})` }),
  flip: (p) => ({ opacity: p, transform: `perspective(1000px) rotateY(${(1 - p) * 90}deg)` }),
  rotate: (p) => ({ opacity: p, transform: `rotate(${(1 - p) * -180}deg) scale(${p})` }),
  bounce: (_, __, bp) => ({ opacity: 1, transform: `translateY(${(1 - bp) * 100}%)` }),
};

// Exit animation lookup table
const exitAnimations: Record<AnimationType, (p: number) => AnimationStyle> = {
  none: () => ({ opacity: 1, transform: "none" }),
  fade: (p) => ({ opacity: 1 - p, transform: "none" }),
  slideUp: (p) => ({ opacity: 1 - p, transform: `translateY(${p * -50}px)` }),
  slideDown: (p) => ({ opacity: 1 - p, transform: `translateY(${p * 50}px)` }),
  slideLeft: (p) => ({ opacity: 1 - p, transform: `translateX(${p * -50}px)` }),
  slideRight: (p) => ({ opacity: 1 - p, transform: `translateX(${p * 50}px)` }),
  scale: (p) => ({ opacity: 1 - p, transform: `scale(${1 - p * 0.5})` }),
  pop: (p) => ({ opacity: 1 - p, transform: `scale(${1 - p * 0.5})` }),
  wipeLeft: (p) => ({ opacity: 1, transform: `translateX(${p * -100}%)` }),
  wipeRight: (p) => ({ opacity: 1, transform: `translateX(${p * 100}%)` }),
  wipeUp: (p) => ({ opacity: 1, transform: `translateY(${p * -100}%)` }),
  wipeDown: (p) => ({ opacity: 1, transform: `translateY(${p * 100}%)` }),
  zoom: (p) => ({ opacity: 1 - p, transform: `scale(${1 + p * 0.5})` }),
  flip: (p) => ({ opacity: 1 - p, transform: `perspective(1000px) rotateY(${p * -90}deg)` }),
  rotate: (p) => ({ opacity: 1 - p, transform: `rotate(${p * 180}deg) scale(${1 - p})` }),
  bounce: (p) => ({ opacity: 1, transform: `translateY(${p * -100}%)` }),
};

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
    const progress = interpolate(frame, [0, ANIM_DURATION], [0, 1], { extrapolateRight: "clamp" });
    const springProgress = spring({ frame, fps, config: { damping: 12 } });
    const bounceProgress = spring({ frame, fps, config: { damping: 8, stiffness: 200 } });
    return enterAnimations[enterAnimation](progress, springProgress, bounceProgress);
  }

  // Exit animation
  if (frame >= exitStart && exitAnimation !== "none") {
    const progress = interpolate(frame, [exitStart, durationInFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return exitAnimations[exitAnimation](progress);
  }

  return { opacity: 1, transform: "none" };
}
