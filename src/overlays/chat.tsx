"use client";

import { useCurrentFrame } from "remotion";
import { Plus, Trash2 } from "lucide-react";
import type { BaseOverlay, OverlayDefinition } from "./base";

export type ChatVariant = "imessage" | "slack";

export interface ChatMessage {
  id: string;
  text: string;
  sent: boolean;
}

export interface ChatOverlayData extends BaseOverlay {
  type: "chat";
  variant: ChatVariant;
  messages: ChatMessage[];
}

const input = "bg-white/5 px-3 py-2 rounded-lg text-sm placeholder:text-white/30 focus:outline-none focus:bg-white/10 transition-colors";

function IMessageChat({ overlay, frame, framesPerMessage }: { overlay: ChatOverlayData; frame: number; framesPerMessage: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(40px)",
        borderRadius: 12,
        boxShadow: "0 22px 70px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "rgba(246, 246, 246, 0.9)",
          padding: "10px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #5AC8FA 0%, #007AFF 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            color: "white",
          }}
        >
          J
        </div>
        <span style={{ color: "#1D1D1F", fontSize: 14, fontWeight: 500 }}>John</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 6, padding: 14 }}>
        {overlay.messages.map((msg, idx) => {
          const messageStart = framesPerMessage * idx;
          const isVisible = frame >= messageStart;
          const messageProgress = Math.min((frame - messageStart) / 12, 1);
          if (!isVisible) return null;
          const isLast = idx === overlay.messages.length - 1 || overlay.messages[idx + 1]?.sent !== msg.sent;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                justifyContent: msg.sent ? "flex-end" : "flex-start",
                opacity: messageProgress,
                transform: `scale(${0.8 + messageProgress * 0.2}) translateY(${(1 - messageProgress) * 10}px)`,
                transformOrigin: msg.sent ? "right bottom" : "left bottom",
              }}
            >
              <div
                style={{
                  background: msg.sent ? "#007AFF" : "#E9E9EB",
                  borderRadius: 18,
                  borderBottomRightRadius: msg.sent && isLast ? 4 : 18,
                  borderBottomLeftRadius: !msg.sent && isLast ? 4 : 18,
                  padding: "8px 14px",
                  maxWidth: "80%",
                }}
              >
                <p style={{ color: msg.sent ? "white" : "#1D1D1F", fontSize: 15, fontWeight: 400, margin: 0, lineHeight: 1.35 }}>
                  {msg.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SlackChat({ overlay, frame, framesPerMessage }: { overlay: ChatOverlayData; frame: number; framesPerMessage: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(40px)",
        borderRadius: 10,
        boxShadow: "0 22px 70px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "rgba(246, 246, 246, 0.9)",
          padding: "10px 14px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: "#1D1D1F", fontSize: 15, fontWeight: 700 }}># general</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 12, padding: 14 }}>
        {overlay.messages.map((msg, idx) => {
          const messageStart = framesPerMessage * idx;
          const isVisible = frame >= messageStart;
          const messageProgress = Math.min((frame - messageStart) / 12, 1);
          if (!isVisible) return null;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                gap: 10,
                opacity: messageProgress,
                transform: `translateY(${(1 - messageProgress) * 10}px)`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 4,
                  background: msg.sent
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {msg.sent ? "Y" : "S"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
                  <span style={{ color: "#1D1D1F", fontSize: 14, fontWeight: 700 }}>{msg.sent ? "You" : "Sarah"}</span>
                  <span style={{ color: "#616061", fontSize: 11 }}>11:42 AM</span>
                </div>
                <p style={{ color: "#1D1D1F", fontSize: 14, fontWeight: 400, margin: 0, lineHeight: 1.4 }}>{msg.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChatRenderer({ overlay, durationInFrames }: { overlay: ChatOverlayData; durationInFrames: number }) {
  const frame = useCurrentFrame();
  const framesPerMessage = durationInFrames / (overlay.messages.length + 1);

  return overlay.variant === "slack"
    ? <SlackChat overlay={overlay} frame={frame} framesPerMessage={framesPerMessage} />
    : <IMessageChat overlay={overlay} frame={frame} framesPerMessage={framesPerMessage} />;
}

export const chatOverlay: OverlayDefinition<ChatOverlayData> = {
  type: "chat",

  isType: (o): o is ChatOverlayData => o.type === "chat",

  create: (overrides) => ({
    id: crypto.randomUUID(),
    type: "chat",
    variant: "imessage",
    messages: [
      { id: crypto.randomUUID(), text: "Hey! How's it going?", sent: false },
      { id: crypto.randomUUID(), text: "Great! Just shipped the new feature", sent: true },
      { id: crypto.randomUUID(), text: "That's awesome! Can't wait to try it", sent: false },
    ],
    x: 55, y: 25, w: 40, h: 50,
    startFrame: 0,
    endFrame: 150,
    enterAnimation: "slideUp",
    exitAnimation: "fade",
    glass: false,
    ...overrides,
  }),

  render: (props) => <ChatRenderer {...props} />,

  editor: ({ overlay, onUpdate }) => (
    <div className="space-y-3">
      <select
        value={overlay.variant}
        onChange={(e) => onUpdate({ variant: e.target.value as ChatVariant })}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${input}`}
      >
        <option value="imessage" className="bg-zinc-900">iMessage</option>
        <option value="slack" className="bg-zinc-900">Slack</option>
      </select>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {overlay.messages.map((msg, idx) => (
          <div key={msg.id} className="flex items-start gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newMessages = overlay.messages.map((m, i) => (i === idx ? { ...m, sent: !m.sent } : m));
                onUpdate({ messages: newMessages });
              }}
              className={`shrink-0 w-6 h-6 rounded-full text-xs ${msg.sent ? "bg-blue-500/80" : "bg-white/20"}`}
            >
              {msg.sent ? "R" : "L"}
            </button>
            <input
              value={msg.text}
              onChange={(e) => {
                const newMessages = overlay.messages.map((m, i) => (i === idx ? { ...m, text: e.target.value } : m));
                onUpdate({ messages: newMessages });
              }}
              onClick={(e) => e.stopPropagation()}
              className={`flex-1 ${input} py-1.5 text-xs`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate({ messages: overlay.messages.filter((_, i) => i !== idx) });
              }}
              className="shrink-0 text-white/30 hover:text-red-400 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const newMsg: ChatMessage = {
            id: crypto.randomUUID(),
            text: "New message",
            sent: overlay.messages.length % 2 === 1,
          };
          onUpdate({ messages: [...overlay.messages, newMsg] });
        }}
        className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs text-white/60 flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Add Message
      </button>
    </div>
  ),
};
