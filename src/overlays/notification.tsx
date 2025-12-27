"use client";

import { Img } from "remotion";
import { Upload } from "lucide-react";
import type { BaseOverlay, OverlayDefinition } from "./base";

export type NotificationVariant = "slack" | "imessage" | "macos";

export interface NotificationOverlayData extends BaseOverlay {
  type: "notification";
  variant: NotificationVariant;
  title: string;
  body: string;
  avatar?: string;
}

const input = "bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";
const btnIcon = "text-white/40 hover:text-white hover:bg-white/5 p-2 rounded-lg cursor-pointer transition-all";

const APP_ICONS: Record<string, string> = {
  slack: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Slack_icon_2019.svg/2048px-Slack_icon_2019.svg.png",
  imessage: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IMessage_logo.svg/2048px-IMessage_logo.svg.png",
};

const APP_NAMES: Record<string, string> = {
  slack: "Slack",
  imessage: "Messages",
  macos: "System",
};

function SlackNotification({ overlay }: { overlay: NotificationOverlayData }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(180, 160, 150, 0.75)",
        backdropFilter: "blur(50px) saturate(180%)",
        WebkitBackdropFilter: "blur(50px) saturate(180%)",
        borderRadius: 22,
        boxShadow: "0 22px 70px rgba(0, 0, 0, 0.25)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: "white",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          <Img src={APP_ICONS.slack} style={{ width: 24, height: 24 }} />
        </div>
        {overlay.avatar ? (
          <Img
            src={overlay.avatar}
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 26,
              height: 26,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(180, 160, 150, 0.9)",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#E8A838",
              border: "2px solid rgba(180, 160, 150, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="#C47F1A" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#C47F1A" />
            </svg>
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: 16, fontWeight: 600, margin: 0, marginBottom: 2 }}>
          {overlay.title}
        </p>
        <p style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: 15, fontWeight: 400, margin: 0, lineHeight: 1.3 }}>
          {overlay.body}
        </p>
      </div>
      <span style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 14, fontWeight: 400, alignSelf: "flex-start", marginTop: 2 }}>
        now
      </span>
    </div>
  );
}

function StandardNotification({ overlay }: { overlay: NotificationOverlayData }) {
  const iconSrc = overlay.avatar || APP_ICONS[overlay.variant];

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(50px) saturate(180%)",
        WebkitBackdropFilter: "blur(50px) saturate(180%)",
        borderRadius: 18,
        border: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0 22px 70px rgba(0, 0, 0, 0.12), 0 0 0 0.5px rgba(0,0,0,0.08)",
        padding: 14,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
      }}
    >
      {iconSrc && (
        <Img src={iconSrc} style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{ color: "rgba(0, 0, 0, 0.45)", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3 }}>
            {APP_NAMES[overlay.variant] || overlay.variant}
          </span>
          <span style={{ color: "rgba(0, 0, 0, 0.3)", fontSize: 13 }}>now</span>
        </div>
        <p style={{ color: "rgba(0, 0, 0, 0.85)", fontSize: 14, fontWeight: 600, margin: 0, marginBottom: 2, letterSpacing: -0.2 }}>
          {overlay.title}
        </p>
        <p style={{ color: "rgba(0, 0, 0, 0.6)", fontSize: 14, fontWeight: 400, margin: 0, lineHeight: 1.35, letterSpacing: -0.1 }}>
          {overlay.body}
        </p>
      </div>
    </div>
  );
}

export const notificationOverlay: OverlayDefinition<NotificationOverlayData> = {
  type: "notification",

  isType: (o): o is NotificationOverlayData => o.type === "notification",

  create: (overrides) => ({
    id: crypto.randomUUID(),
    type: "notification",
    variant: "slack",
    title: "John Doe",
    body: "Hey! Check out this new feature",
    x: 60, y: 5, w: 35, h: 8,
    startFrame: 30,
    endFrame: 120,
    enterAnimation: "slideLeft",
    exitAnimation: "slideRight",
    glass: false,
    ...overrides,
  }),

  render: ({ overlay }) =>
    overlay.variant === "slack"
      ? <SlackNotification overlay={overlay} />
      : <StandardNotification overlay={overlay} />,

  editor: ({ overlay, onUpdate }) => (
    <div className="space-y-3">
      <select
        value={overlay.variant}
        onChange={(e) => onUpdate({ variant: e.target.value as NotificationVariant })}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${input}`}
      >
        <option value="slack" className="bg-zinc-900">Slack</option>
        <option value="imessage" className="bg-zinc-900">iMessage</option>
        <option value="macos" className="bg-zinc-900">macOS</option>
      </select>
      <input
        value={overlay.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        placeholder="Title / Sender"
        className={`w-full ${input}`}
      />
      <input
        value={overlay.body}
        onChange={(e) => onUpdate({ body: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        placeholder="Message body"
        className={`w-full ${input}`}
      />
      <div className="flex gap-2">
        <input
          value={overlay.avatar || ""}
          onChange={(e) => onUpdate({ avatar: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="Avatar URL (optional)"
          className={`flex-1 ${input}`}
        />
        <label className={btnIcon}>
          <Upload size={14} />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpdate({ avatar: URL.createObjectURL(file) });
            }}
          />
        </label>
      </div>
    </div>
  ),
};
