/**
 * Lightweight Remotion stubs for browser-side animation preview.
 * These implement the core animation functions without the full Remotion bundle.
 */

interface InterpolateOptions {
  extrapolateLeft?: "clamp" | "extend";
  extrapolateRight?: "clamp" | "extend";
}

export function interpolate(
  input: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  options?: InterpolateOptions
): number {
  if (inputRange.length !== outputRange.length) {
    throw new Error("inputRange and outputRange must have the same length");
  }

  if (inputRange.length < 2) {
    throw new Error("inputRange must have at least 2 values");
  }

  // Handle extrapolation
  const extrapolateLeft = options?.extrapolateLeft ?? "extend";
  const extrapolateRight = options?.extrapolateRight ?? "extend";

  if (input < inputRange[0]) {
    if (extrapolateLeft === "clamp") {
      return outputRange[0];
    }
    // Linear extrapolation
    const slope = (outputRange[1] - outputRange[0]) / (inputRange[1] - inputRange[0]);
    return outputRange[0] + slope * (input - inputRange[0]);
  }

  if (input > inputRange[inputRange.length - 1]) {
    if (extrapolateRight === "clamp") {
      return outputRange[outputRange.length - 1];
    }
    // Linear extrapolation
    const lastIdx = inputRange.length - 1;
    const slope =
      (outputRange[lastIdx] - outputRange[lastIdx - 1]) /
      (inputRange[lastIdx] - inputRange[lastIdx - 1]);
    return outputRange[lastIdx] + slope * (input - inputRange[lastIdx]);
  }

  // Find the segment
  let segmentIndex = 0;
  for (let i = 1; i < inputRange.length; i++) {
    if (input <= inputRange[i]) {
      segmentIndex = i - 1;
      break;
    }
  }

  const inputStart = inputRange[segmentIndex];
  const inputEnd = inputRange[segmentIndex + 1];
  const outputStart = outputRange[segmentIndex];
  const outputEnd = outputRange[segmentIndex + 1];

  const progress = (input - inputStart) / (inputEnd - inputStart);
  return outputStart + progress * (outputEnd - outputStart);
}

interface SpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
}

interface SpringOptions {
  frame: number;
  fps: number;
  config?: SpringConfig;
  from?: number;
  to?: number;
}

export function spring({
  frame,
  fps,
  config = {},
  from = 0,
  to = 1,
}: SpringOptions): number {
  const { damping = 10, stiffness = 100, mass = 1 } = config;

  // Simple spring physics simulation
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const t = frame / fps;

  let value: number;

  if (zeta < 1) {
    // Underdamped
    const omegaD = omega * Math.sqrt(1 - zeta * zeta);
    value = 1 - Math.exp(-zeta * omega * t) * (Math.cos(omegaD * t) + (zeta * omega / omegaD) * Math.sin(omegaD * t));
  } else if (zeta === 1) {
    // Critically damped
    value = 1 - (1 + omega * t) * Math.exp(-omega * t);
  } else {
    // Overdamped
    const r1 = -omega * (zeta - Math.sqrt(zeta * zeta - 1));
    const r2 = -omega * (zeta + Math.sqrt(zeta * zeta - 1));
    const c2 = (r1) / (r1 - r2);
    const c1 = 1 - c2;
    value = 1 - (c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t));
  }

  // Clamp to prevent overshoot issues
  value = Math.max(0, Math.min(1, value));

  return from + (to - from) * value;
}

// Re-export for use in generated code
export const remotionStubs = {
  interpolate,
  spring,
};
