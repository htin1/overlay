"use client";

import { useState, useCallback, useRef } from "react";
import { evaluateAnimationCode } from "@/lib/sandbox/evaluator";

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface QuestionData {
  header?: string;
  question: string;
  options: QuestionOption[];
}

export type { MentionedMedia } from "@/types/media";
import type { MentionedMedia } from "@/types/media";

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
  status: "pending" | "complete" | "error";
  result?: unknown;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "question";
  content: string;
  questions?: QuestionData[];
  answeredIndices?: number[];
  mentionedMedia?: MentionedMedia[];
  isError?: boolean;
  toolCalls?: ToolCall[];
}

export interface OverlayConfig {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

interface UseAnimationChatOptions {
  onCodeGenerated?: (code: string, config?: OverlayConfig) => void;
  currentCode?: string;
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  model?: string;
  brandAssets?: {
    url: string;
    domain: string;
    colors: { hex: string; name?: string; source: string }[];
    images: { url: string; alt?: string; type: string }[];
    text: { content: string; type: string }[];
  } | null;
}

const MAX_RETRIES = 2;

export function useAnimationChat({
  onCodeGenerated,
  currentCode,
  messages: controlledMessages = [],
  onMessagesChange,
  model,
  brandAssets,
}: UseAnimationChatOptions = {}) {
  const messagesRef = useRef(controlledMessages);
  messagesRef.current = controlledMessages;

  const callbacksRef = useRef({ onMessagesChange, onCodeGenerated });
  const retryCountRef = useRef(0);

  const updateMessages = useCallback((updater: Message[] | ((prev: Message[]) => Message[])) => {
    const newMessages = typeof updater === "function" ? updater(messagesRef.current) : updater;
    messagesRef.current = newMessages;
    (callbacksRef.current.onMessagesChange ?? onMessagesChange)?.(newMessages);
  }, [onMessagesChange]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, isAutoRetry = false, mentionedMedia?: MentionedMedia[]) => {
    if (!content.trim() || (!isAutoRetry && isLoading)) return;
    if (!isAutoRetry) retryCountRef.current = 0;

    callbacksRef.current = { onMessagesChange, onCodeGenerated };
    const trimmedContent = content.trim();

    if (!isAutoRetry) {
      updateMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedContent,
        mentionedMedia: mentionedMedia?.length ? mentionedMedia : undefined,
      }]);
    }
    setInput("");
    setIsLoading(true);

    try {
      const apiMessages = messagesRef.current
        .filter((m) => m.content.trim() !== "")
        .map((m) => ({
          role: m.role === "question" ? "assistant" : m.role,
          content: m.content,
          mentionedMedia: m.mentionedMedia,
        }));
      if (isAutoRetry) {
        apiMessages.push({ role: "user", content: trimmedContent, mentionedMedia: undefined });
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          currentCode,
          model,
          brandAssets: brandAssets ?? undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate animation");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const assistantMessageId = crypto.randomUUID();
      updateMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      let fullContent = "";
      const toolCalls = new Map<string, ToolCall>();
      let buffer = "";
      let generatedCode: string | null = null;
      let generatedConfig: OverlayConfig | null = null;
      let questions: QuestionData[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const colonIndex = line.indexOf(":");
          if (colonIndex === -1) continue;

          const type = line.slice(0, colonIndex);
          const data = line.slice(colonIndex + 1);

          try {
            if (type === "0") {
              fullContent += JSON.parse(data);
            } else if (type === "9") {
              const tc = JSON.parse(data);
              if (tc.toolName && tc.toolCallId) {
                toolCalls.set(tc.toolCallId, {
                  id: tc.toolCallId,
                  name: tc.toolName,
                  args: tc.args || {},
                  status: tc.toolName === "searchIcons" ? "pending" : "complete",
                });

                if (tc.toolName === "generate" && tc.args?.code) {
                  generatedCode = tc.args.code;
                  generatedConfig = tc.args.config || null;
                } else if (tc.toolName === "askQuestions" && tc.args?.questions) {
                  questions = tc.args.questions.map((q: { header?: string; question: string; options: { label: string; description?: string }[] }) => ({
                    header: q.header,
                    question: q.question,
                    options: q.options.map((opt, idx) => ({ id: `opt-${idx}`, ...opt })),
                  }));
                }
              }
            } else if (type === "a") {
              const result = JSON.parse(data);
              const existing = toolCalls.get(result.toolCallId);
              if (existing) {
                toolCalls.set(result.toolCallId, { ...existing, status: "complete", result: result.result });
              }
            }
          } catch { /* skip malformed */ }
        }

        updateMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, content: fullContent, toolCalls: toolCalls.size > 0 ? Array.from(toolCalls.values()) : undefined }
              : m
          )
        );
      }

      // Helper to handle code evaluation and retry
      const handleCode = (code: string, config?: OverlayConfig | null) => {
        const { error } = evaluateAnimationCode(code);
        if (error) {
          const canRetry = retryCountRef.current < MAX_RETRIES;
          updateMessages((prev) => [...prev, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `Error: ${error}${canRetry ? ". Retrying..." : ""}`,
            isError: true,
          }]);
          if (canRetry) {
            retryCountRef.current++;
            setIsLoading(false);
            setTimeout(() => sendMessage(`Code error: "${error}". Please fix.`, true), 100);
          } else {
            retryCountRef.current = 0;
          }
          return false;
        }
        retryCountRef.current = 0;
        updateMessages((prev) =>
          prev.map((m) => m.id === assistantMessageId ? { ...m, content: fullContent || "Generated animation." } : m)
        );
        callbacksRef.current.onCodeGenerated?.(code, config ?? undefined);
        return true;
      };

      // Process results
      if (questions.length > 0) {
        updateMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, role: "question", questions, answeredIndices: [], content: questions.map((q) => q.question).join("\n") }
              : m
          )
        );
      } else if (generatedCode) {
        handleCode(generatedCode, generatedConfig);
      } else {
        // Fallback: extract code from text
        const match = fullContent.match(/```tsx\n([\s\S]*?)```/);
        if (match) handleCode(match[1].trim());
      }
    } catch (err) {
      console.error("Chat error:", err);
      updateMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Failed to generate animation. Please try again.",
        isError: true,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [updateMessages, currentCode, isLoading, onMessagesChange, onCodeGenerated, model, brandAssets]);

  const pendingAnswersRef = useRef<Map<string, string[]>>(new Map());

  const answerQuestion = useCallback(
    (messageId: string, questionIndex: number, option: QuestionOption) => {
      const message = messagesRef.current.find(m => m.id === messageId);
      if (!message?.questions) return;

      const total = message.questions.length;
      if (!pendingAnswersRef.current.has(messageId)) {
        pendingAnswersRef.current.set(messageId, new Array(total).fill(""));
      }
      const answers = pendingAnswersRef.current.get(messageId)!;
      answers[questionIndex] = option.label;

      const answeredIndices = answers.map((a, i) => a ? i : -1).filter(i => i >= 0);
      updateMessages((prev) => prev.map((m) => m.id === messageId ? { ...m, answeredIndices } : m));

      if (answeredIndices.length === total) {
        const combined = message.questions.map((q, i) => `${q.header || q.question}: ${answers[i]}`).join("\n");
        pendingAnswersRef.current.delete(messageId);
        sendMessage(combined);
      }
    },
    [sendMessage, updateMessages]
  );

  return {
    messages: controlledMessages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleSubmit: useCallback((e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      sendMessage(input);
    }, [input, sendMessage]),
    answerQuestion,
  };
}
