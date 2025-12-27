import type { Overlay } from "@/overlays/registry";
import { createTypingText, createNotification, createChat } from "./utils";

export interface Template {
  id: string;
  name: string;
  description: string;
  category: "text" | "notification" | "chat";
  icon: string;
  create: () => Overlay;
}

export const templates: Template[] = [
  // Terminal - dark theme
  {
    id: "terminal",
    name: "Terminal",
    description: "macOS Terminal with typing effect",
    category: "text",
    icon: "terminal",
    create: () =>
      createTypingText({
        text: '$ npm install @awesome/package\n\nadded 42 packages in 2.1s',
        fontFamily: "JetBrains Mono",
        fontSize: 14,
        cursorBlink: true,
        x: 5,
        y: 50,
        w: 45,
        h: 28,
      }),
  },

  // Notification - light theme
  {
    id: "notification",
    name: "Notification",
    description: "macOS notification popup",
    category: "notification",
    icon: "bell",
    create: () =>
      createNotification({
        variant: "imessage",
        title: "Sarah",
        body: "Are you free for lunch today?",
        x: 60,
        y: 3,
        w: 36,
        h: 9,
      }),
  },

  // Chat - light theme
  {
    id: "chat",
    name: "Messages",
    description: "iMessage conversation",
    category: "chat",
    icon: "messages",
    create: () => createChat(),
  },
];

export const templateCategories = [
  { id: "text", name: "Text Effects", icon: "type" },
  { id: "notification", name: "Notifications", icon: "bell" },
  { id: "chat", name: "Conversations", icon: "messages" },
] as const;

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => t.category === category);
}
