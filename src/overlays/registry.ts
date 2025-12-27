import { imageOverlay, type ImageOverlayData } from "./image";
import { videoOverlay, type VideoOverlayData } from "./video";
import { textOverlay, type TextOverlayData } from "./text";
import { typingTextOverlay, type TypingTextOverlayData } from "./typing-text";
import { notificationOverlay, type NotificationOverlayData, type NotificationVariant } from "./notification";
import { chatOverlay, type ChatOverlayData, type ChatVariant, type ChatMessage } from "./chat";
import type { BaseOverlay, OverlayDefinition } from "./base";

// All overlay definitions in one place
export const overlayRegistry = {
  image: imageOverlay,
  video: videoOverlay,
  text: textOverlay,
  "typing-text": typingTextOverlay,
  notification: notificationOverlay,
  chat: chatOverlay,
} as const;

export type OverlayType = keyof typeof overlayRegistry;

// Union of all overlay data types
export type Overlay =
  | ImageOverlayData
  | VideoOverlayData
  | TextOverlayData
  | TypingTextOverlayData
  | NotificationOverlayData
  | ChatOverlayData;

// Helper to get definition for an overlay
export function getOverlayDefinition(type: string): OverlayDefinition<BaseOverlay> | undefined {
  return overlayRegistry[type as OverlayType] as unknown as OverlayDefinition<BaseOverlay> | undefined;
}

// Type guards - generated from registry
export const isMediaOverlay = (o: Overlay): o is ImageOverlayData | VideoOverlayData =>
  o.type === "image" || o.type === "video";

// Re-export types for convenience
export type {
  BaseOverlay,
  OverlayDefinition,
  ImageOverlayData,
  VideoOverlayData,
  TextOverlayData,
  TypingTextOverlayData,
  NotificationOverlayData,
  NotificationVariant,
  ChatOverlayData,
  ChatVariant,
  ChatMessage,
};

// Re-export from base
export { ANIMATION_TYPES, type AnimationType } from "./base";
