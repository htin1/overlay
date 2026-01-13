import { mediaOverlay, type MediaOverlayData } from "./media";
import { textOverlay, type TextOverlayData } from "./text";
import { typingTextOverlay, type TypingTextOverlayData } from "./typing-text";
import { notificationOverlay, type NotificationOverlayData, type NotificationVariant } from "./notification";
import { chatOverlay, type ChatOverlayData, type ChatVariant, type ChatMessage } from "./chat";
import type { BaseOverlay, OverlayDefinition } from "./base";

// All overlay definitions in one place
export const overlayRegistry = {
  media: mediaOverlay,
  text: textOverlay,
  "typing-text": typingTextOverlay,
  notification: notificationOverlay,
  chat: chatOverlay,
} as const;

export type OverlayType = keyof typeof overlayRegistry;

// Union of all overlay data types
export type Overlay =
  | MediaOverlayData
  | TextOverlayData
  | TypingTextOverlayData
  | NotificationOverlayData
  | ChatOverlayData;

// Helper to get definition for an overlay
export function getOverlayDefinition(type: string): OverlayDefinition<BaseOverlay> | undefined {
  return overlayRegistry[type as OverlayType] as unknown as OverlayDefinition<BaseOverlay> | undefined;
}

// Type guards
export const isMediaOverlay = (o: Overlay): o is MediaOverlayData => o.type === "media";

// Re-export types for convenience
export type {
  BaseOverlay,
  OverlayDefinition,
  MediaOverlayData,
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
