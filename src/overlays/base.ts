/**
 * ADDING A NEW OVERLAY TYPE
 *
 * 1. Create `src/overlays/my-overlay.tsx`
 *
 * 2. Define interface + implementation:
 *
 *    export interface MyOverlayData extends BaseOverlay {
 *      type: "my-overlay";
 *      // custom fields...
 *    }
 *
 *    export const myOverlay: OverlayDefinition<MyOverlayData> = {
 *      type: "my-overlay",
 *      isType: (o) => o.type === "my-overlay",
 *      create: (overrides) => ({ id: crypto.randomUUID(), type: "my-overlay", ... }),
 *      render: ({ overlay, durationInFrames }) => <MyRenderer ... />,
 *      editor: ({ overlay, onUpdate }) => <MyEditor ... />,
 *    };
 *
 * 3. Register in `registry.ts`:
 *    - Import your overlay
 *    - Add to `overlayRegistry` object
 *    - Add to `Overlay` union type
 *
 * Done! OverlayItem and OverlayCard automatically use the registry.
 */

import type React from "react";

export const ANIMATION_TYPES = [
  "none",
  "fade",
  "slideUp",
  "slideDown",
  "slideLeft",
  "slideRight",
  "scale",
  "pop",
  "wipeLeft",
  "wipeRight",
  "wipeUp",
  "wipeDown",
  "zoom",
  "flip",
  "rotate",
  "bounce",
] as const;

export type AnimationType = (typeof ANIMATION_TYPES)[number];

export interface BaseOverlay {
  id: string;
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  startFrame: number;
  endFrame: number;
  enterAnimation?: AnimationType;
  exitAnimation?: AnimationType;
  glass?: boolean;
  visible?: boolean; // defaults to true if undefined
}

export interface OverlayDefinition<T extends BaseOverlay = BaseOverlay> {
  type: T["type"];
  create: (overrides?: Partial<T>) => T;
  render: (props: { overlay: T; durationInFrames: number }) => React.ReactNode;
  editor: (props: { overlay: T; onUpdate: (data: Partial<T>) => void }) => React.ReactNode;
  isType: (o: BaseOverlay) => o is T;
}
