// Type-only exports (safe for barrel)
export type {
  OverlayType,
  Overlay,
  BaseOverlay,
  OverlayDefinition,
  AnimationType,
  ImageOverlayData,
  VideoOverlayData,
  TextOverlayData,
  TypingTextOverlayData,
  NotificationOverlayData,
  NotificationVariant,
  ChatOverlayData,
  ChatVariant,
  ChatMessage,
} from "./registry";

// Re-export constants (no runtime dependency)
export { ANIMATION_TYPES } from "./base";

// Re-export runtime functions from registry
// Note: These create the circular dependency if overlay files import from here
export { overlayRegistry, getOverlayDefinition, isMediaOverlay } from "./registry";
