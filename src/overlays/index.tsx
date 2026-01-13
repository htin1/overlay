"use client";

import { useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";
import { TOTAL_FRAMES } from "@/lib/constants";
import { evaluateAnimationCode } from "@/lib/sandbox/evaluator";
import { AlertCircle } from "lucide-react";
import type { Message } from "@/hooks/useAnimationChat";

// Base overlay interface
export interface Overlay {
  id: string;
  type: "code";
  code: string;
  prompt: string;
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  endFrame: number;
  glass?: boolean;
  visible?: boolean;
  messages?: Message[];
}

// Renderer component
function CodeRenderer({ overlay }: { overlay: Overlay }) {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();

  const { component: Component, error } = useMemo(() => {
    if (!overlay.code) {
      return { component: null, error: null };
    }
    return evaluateAnimationCode(overlay.code);
  }, [overlay.code]);

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          padding: 20,
          color: "#ef4444",
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        <AlertCircle size={24} />
        <p style={{ marginTop: 8, textAlign: "center" }}>{error}</p>
      </div>
    );
  }

  if (!Component) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#71717a",
          fontFamily: "system-ui",
          fontSize: 14,
        }}
      >
        No code yet
      </div>
    );
  }

  return (
    <Component
      frame={frame}
      durationInFrames={durationInFrames}
      width={width}
      height={height}
    />
  );
}

// Overlay definition
export const codeOverlay = {
  create: (overrides?: Partial<Overlay>): Overlay => ({
    id: crypto.randomUUID(),
    type: "code",
    code: "",
    prompt: "",
    x: 0,
    y: 0,
    w: 100,
    h: 100,
    startFrame: 0,
    endFrame: TOTAL_FRAMES,
    glass: false,
    messages: [],
    ...overrides,
  }),

  render: ({ overlay }: { overlay: Overlay; durationInFrames?: number }) => <CodeRenderer overlay={overlay} />,

  editor: ({ overlay }: { overlay: Overlay }) => (
    <div className="space-y-3">
      {overlay.prompt && (
        <div className="text-xs text-zinc-400">
          <span className="text-zinc-500">Prompt:</span> {overlay.prompt}
        </div>
      )}
      {!overlay.code && (
        <p className="text-xs text-zinc-500">
          Use the chat to generate animation code
        </p>
      )}
    </div>
  ),
};

// Helper to get overlay definition
export function getOverlayDefinition(_type: string) {
  return codeOverlay;
}
