"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, Code2, Send, Loader2, Wand2, Settings, Plus, X, ChevronDown, ChevronRight, MessageCircleQuestion, Check, Search } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import ReactMarkdown from "react-markdown";
import type { Overlay } from "@/overlays";
import { useTheme } from "@/hooks/useTheme";
import { useAnimationChat, type ToolCall } from "@/hooks/useAnimationChat";
import { useOverlayContext } from "@/contexts/OverlayContext";
import type { MentionedMedia } from "@/types/media";
import { AskQuestion } from "./AskQuestion";
import { MentionInput } from "./MentionInput";
import { parseConfig, updateConfigValue, parseDurationFrames } from "@/lib/parseConfig";
import { AI_MODELS, type AIModelId, DEFAULT_AI_MODEL } from "@/lib/constants";

interface Props {
  overlay: Overlay | null;
  onUpdate: (data: Partial<Overlay>) => void;
  onRemove: () => void;
}

type Tab = "chat" | "settings" | "code";

const SUGGESTIONS = [
  { label: "Subscribe button", prompt: "YouTube-style subscribe button with the Youtube logo and an cursor that clicks the button" },
  { label: "Typing text", prompt: "Typewriter effect that types out 'Coming Soon...', 'Stay Tuned!' and 'Palmier 2026' (in purple color). All three sentences coming out one after the other. No background, just text. Jetbrains Mono font." },
  { label: "Notification", prompt: "multiple macOS-style notifications that slides in from top-right with message 'Palmier Animation is coming soon!'. From iMessage, Slack, Microsft Teams, Gmail." },
  { label: "Claude Cowork", prompt: "Create an animation from @Sample 4 and it clicks on 'Create a file' button then it pops up the MacOS file explorer. You shoudl look at the image and recreate the animation with react, do not use the image in the code." },
  { label: "Logo reveal", prompt: "Animated a logo reveal provided in @Sample 5 along with the text 'Palmier' on its right. transparent background." },
  { label: "Orbit cards", prompt: "Create an orbit-style card carousel with @Sample 1, @Sample 2, and @Sample 3. Cards arranged in a fan/arc pattern emerging from a curved surface at the bottom (like sitting on a sphere). Each card has rounded corners, slight rotation at different angles, and overlaps with neighbors. Center card is most prominent and upright, outer cards tilt away. Add subtle shadows between cards for depth. Smooth animation that rotates the cards around the orbit." },
  { label: "Code Screenshot", prompt: "a vscode screenshot of some python functions" },
  { label: "Slack Message", prompt: "a Slack channel between Marcos and Harrison discussing about how to surf a barrel. Use slack color palette." },
  { label: "Glass overlay", prompt: "a screenshot of a conversation between Michael and Dalton about who to fund for series A. Use Apple-like glass overlay style." },
  { label: "Linkedin Page", prompt: "an animation of scrolling through a Linkedin page in Macbook view." },
  { label: "Three Blue One Brown", prompt: "a three-blue-one-brown style animation explaining the difference between a sin wave and a cosine wave. Add caption at the bottom (colored animation so it looks like reading it word by word). 30 seconds, content is very detailed and should explain nicely to someone who doesn't understand the concept." },
  { label: "ChatGPT", prompt: "a screenshot of ChatGPT UI with a conversation between a user and ChatGPT. The user asks: 'How to use Adobe After Effects?'. ChatGPT response something funny like: you still use after effects in 2026? use palmier instead! Use ChatGPT color palette." },
];

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "chat", label: "Generate", icon: <Wand2 size={12} /> },
  { id: "settings", label: "Settings", icon: <Settings size={12} /> },
  { id: "code", label: "Code", icon: <Code2 size={12} /> },
];

// Reusable thinking/loading indicator
function ThinkingIndicator({ text = "Thinking" }: { text?: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
      <span className="animate-pulse">{text}</span>
      <span className="flex gap-0.5">
        {[0, 150, 300].map((delay) => (
          <span key={delay} className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
        ))}
      </span>
    </span>
  );
}

const TOOL_INFO: Record<string, { icon: React.ReactNode; label: string }> = {
  generate: { icon: <Check size={12} />, label: "Generated" },
  askQuestions: { icon: <MessageCircleQuestion size={12} />, label: "Asked questions" },
  searchIcons: { icon: <Search size={12} />, label: "Searched icons" },
};

function ToolCallDisplay({ toolCall, isStreaming }: { toolCall: ToolCall; isStreaming: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const info = TOOL_INFO[toolCall.name] || { icon: <Wand2 size={12} />, label: toolCall.name };
  const isPending = toolCall.status === "pending" && isStreaming;

  // Show cooking indicator while tool is pending
  if (isPending) {
    return <ThinkingIndicator text="Cooking" />;
  }

  const details = toolCall.name === "searchIcons"
    ? `Query: "${(toolCall.args as { query?: string }).query}"${toolCall.result ? `\n\nResults:\n${toolCall.result}` : ""}`
    : null;

  return (
    <div className="text-[11px]">
      <button
        onClick={() => details && setIsOpen(!isOpen)}
        disabled={!details}
        className={`flex items-center gap-1.5 ${details ? "cursor-pointer hover:text-zinc-300" : "cursor-default"} text-zinc-500 dark:text-zinc-400`}
      >
        {info.icon}
        <span>{info.label}</span>
        {details && (isOpen ? <ChevronDown size={10} /> : <ChevronRight size={10} />)}
      </button>
      {details && isOpen && (
        <pre className="mt-1 ml-4 p-2 text-[10px] bg-zinc-100 dark:bg-zinc-800 rounded overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
          {details}
        </pre>
      )}
    </div>
  );
}

export function RightPanel({ overlay, onUpdate, onRemove }: Props) {
  const { theme } = useTheme();
  const { media, addOverlay, brandAssets } = useOverlayContext();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [selectedModel, setSelectedModel] = useState<AIModelId>(DEFAULT_AI_MODEL);
  const [mentionedMedia, setMentionedMedia] = useState<MentionedMedia[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoGenerated = useRef<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { messages, input: chatInput, setInput: setChatInput, isLoading, sendMessage, answerQuestion } = useAnimationChat({
    onCodeGenerated: (code, config) => {
      if (!overlay) return;
      const updates: Partial<Overlay> = { code };
      const duration = parseDurationFrames(code);
      if (duration) updates.endFrame = overlay.startFrame + duration;
      if (config) {
        if (config.x !== undefined) updates.x = config.x;
        if (config.y !== undefined) updates.y = config.y;
        if (config.w !== undefined) updates.w = config.w;
        if (config.h !== undefined) updates.h = config.h;
      }
      onUpdate(updates);
    },
    currentCode: overlay?.code,
    messages: overlay?.messages ?? [],
    onMessagesChange: (msgs) => onUpdate({ messages: msgs }),
    model: selectedModel,
    brandAssets,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (overlay?.prompt && !overlay.code && hasAutoGenerated.current !== overlay.id) {
      hasAutoGenerated.current = overlay.id;
      sendMessage(overlay.prompt);
    }
  }, [overlay?.id, overlay?.prompt, overlay?.code, sendMessage]);

  useEffect(() => {
    if (!overlay?.code) setActiveTab("chat");
  }, [overlay?.id, overlay?.code]);

  if (!overlay) {
    return (
      <div className="w-96 border-l border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Wand2 size={20} className="text-zinc-400" />
          </div>
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">No layer selected</h3>
          <p className="text-xs text-zinc-500 mb-4">Select a layer to edit or create a new one</p>
          {addOverlay && (
            <button onClick={addOverlay} className="px-3 py-1.5 text-xs bg-forest-500 hover:bg-forest-600 text-white rounded-lg transition-colors">
              + New Layer
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-96 border-l border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-white/5 shrink-0">
        <div className="h-10 flex items-center justify-between px-3">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "border border-forest-500 text-zinc-900 dark:text-white"
                    : "border border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {addOverlay && (
              <button onClick={addOverlay} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white p-1 rounded transition-colors" title="New layer">
                <Plus size={14} />
              </button>
            )}
            <button onClick={onRemove} className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors" title="Delete layer">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "code" && (
          <div className="flex-1 overflow-auto">
            {overlay.code ? (
              <CodeMirror
                value={overlay.code}
                height="100%"
                theme={theme === "dark" ? vscodeDark : undefined}
                extensions={[javascript({ jsx: true, typescript: true })]}
                onChange={(value) => onUpdate({ code: value })}
                basicSetup={{ lineNumbers: true, foldGutter: false, dropCursor: false, allowMultipleSelections: false, indentOnInput: false }}
                style={{ fontSize: 11 }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-400 text-sm p-4">
                <p>Use the AI tab to generate code</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex-1 overflow-y-auto p-3">
            {overlay.code ? (
              (() => {
                const config = parseConfig(overlay.code);
                if (config.length === 0) return <div className="text-center text-zinc-400 text-xs pt-4">No configurable settings found</div>;
                return (
                  <div className="space-y-3">
                    {config.map((entry) => (
                      <div key={entry.key}>
                        <label className="block text-[10px] text-zinc-500 mb-1">{entry.key}</label>
                        {entry.type === "color" ? (
                          <div className="flex items-center gap-2">
                            <input type="color" value={entry.value as string} onChange={(e) => onUpdate({ code: updateConfigValue(overlay.code, entry.key, e.target.value) })} className="w-8 h-8 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer" />
                            <input type="text" value={entry.value as string} onChange={(e) => onUpdate({ code: updateConfigValue(overlay.code, entry.key, e.target.value) })} className="flex-1 px-2 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded border-0 outline-none focus:ring-1 focus:ring-forest-500" />
                          </div>
                        ) : (
                          <input
                            type={entry.type === "number" ? "number" : "text"}
                            value={entry.value as string | number}
                            onChange={(e) => onUpdate({ code: updateConfigValue(overlay.code, entry.key, entry.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value) })}
                            className="w-full px-2 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded border-0 outline-none focus:ring-1 focus:ring-forest-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()
            ) : (
              <div className="text-center text-zinc-400 text-xs pt-4">Generate an animation first</div>
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-zinc-500 text-center pt-2">Describe your animation or pick an example</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => {
                          setChatInput(s.prompt);
                          setMentionedMedia(media.filter((item) => s.prompt.toLowerCase().includes(`@${item.name.toLowerCase()}`)));
                        }}
                        className="px-2.5 py-1.5 text-[11px] rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-forest-500 hover:text-white text-zinc-600 dark:text-zinc-400 transition-colors"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {media.length > 0 && <p className="text-[10px] text-zinc-400 text-center">Tip: Reference media with @name</p>}
                </div>
              )}

              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                const isStreaming = isLoading && isLast && message.role === "assistant";

                if (message.role === "question" && message.questions) {
                  return (
                    <div key={message.id} className="mr-4 flex flex-col gap-3">
                      {message.questions.map((q, i) => (
                        <AskQuestion
                          key={`${message.id}-${i}`}
                          header={q.header}
                          question={q.question}
                          options={q.options}
                          onSelect={(opt) => answerQuestion(message.id, i, opt)}
                          disabled={isLoading || (message.answeredIndices ?? []).includes(i) || !isLast}
                        />
                      ))}
                    </div>
                  );
                }

                if (message.isError) {
                  return (
                    <div key={message.id} className="text-[11px]">
                      <div className="flex items-center gap-1 text-red-500"><X size={12} /><span>Error</span></div>
                      <pre className="mt-1 ml-4 p-2 text-[10px] bg-red-500/10 text-red-400 rounded overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">{message.content}</pre>
                    </div>
                  );
                }

                if (message.role === "user") {
                  return (
                    <div key={message.id} className="ml-6 border border-forest-500 text-zinc-900 dark:text-white rounded-xl rounded-tr-sm p-2.5 text-xs">
                      {message.content}
                    </div>
                  );
                }

                // Show thinking when streaming and no pending tool calls (waiting for next action)
                const hasPendingTool = message.toolCalls?.some((t) => t.status === "pending");
                const hasTerminalTool = message.toolCalls?.some((t) => t.name === "generate" || t.name === "askQuestions");
                const showThinking = isStreaming && !hasPendingTool && !hasTerminalTool;

                return (
                  <div key={message.id} className="text-[11px] text-zinc-500 dark:text-zinc-400 space-y-1.5">
                    {/* Show text content */}
                    {message.content && (
                      <div className="prose prose-xs prose-zinc dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="my-1 text-[11px] leading-relaxed">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            code: ({ children }) => <code className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px]">{children}</code>,
                            ul: ({ children }) => <ul className="my-1 ml-3 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-1 ml-3 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-0.5">{children}</li>,
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    {/* Show tool calls */}
                    {message.toolCalls?.map((t) => <ToolCallDisplay key={t.id} toolCall={t} isStreaming={isStreaming} />)}
                    {/* Show thinking when waiting */}
                    {showThinking && <ThinkingIndicator />}
                  </div>
                );
              })}

              {isLoading && messages.length > 0 && messages[messages.length - 1].role !== "assistant" && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <form
              ref={formRef}
              onSubmit={(e) => {
                e.preventDefault();
                if (chatInput.trim() && !isLoading) {
                  sendMessage(chatInput, false, mentionedMedia);
                  setChatInput("");
                  setMentionedMedia([]);
                }
              }}
              className="p-3 border-t border-zinc-200 dark:border-zinc-800"
            >
              <MentionInput
                value={chatInput}
                onChange={setChatInput}
                onSubmit={() => formRef.current?.requestSubmit()}
                placeholder="Describe animation... (@ to mention media)"
                disabled={isLoading}
                media={media}
                mentionedMedia={mentionedMedia}
                onMentionedMediaChange={setMentionedMedia}
                submitButton={
                  <button type="submit" disabled={isLoading || !chatInput.trim()} className="absolute right-2 bottom-2 p-1.5 bg-forest-500 hover:bg-forest-600 disabled:opacity-50 text-white rounded-md transition-colors">
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </button>
                }
              />
              <div className="mt-2">
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value as AIModelId)} className="px-1.5 py-1 text-[10px] bg-transparent text-zinc-400 rounded border-0 outline-none cursor-pointer hover:text-zinc-300 transition-colors" disabled={isLoading}>
                  {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
