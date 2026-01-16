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

export interface Message {
  id: string;
  role: "user" | "assistant" | "question";
  content: string;
  questions?: QuestionData[];
  answeredIndices?: number[];
  mentionedMedia?: MentionedMedia[];
}

interface UseAnimationChatOptions {
  onCodeGenerated?: (code: string, config?: OverlayConfig) => void;
  currentCode?: string;
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
  model?: string;
}

interface StreamCallbacks {
  onMessagesChange: ((messages: Message[]) => void) | undefined;
  onCodeGenerated: ((code: string, config?: OverlayConfig) => void) | undefined;
}

const MAX_RETRIES = 2; // Maximum automatic retry attempts for code errors

function parseQuestionResponse(content: string): QuestionData[] {
  const regex = /<<<QUESTION_JSON>>>([\s\S]*?)<<<END_QUESTION_JSON>>>/g;
  const questions: QuestionData[] = [];

  for (const match of content.matchAll(regex)) {
    try {
      const data = JSON.parse(match[1].trim());
      questions.push({
        header: data.header,
        question: data.question,
        options: data.options.map((opt: { label: string; description?: string }, idx: number) => ({
          id: `opt-${idx}`,
          label: opt.label,
          description: opt.description,
        })),
      });
    } catch {
      // Skip malformed JSON blocks
    }
  }

  return questions;
}

export interface OverlayConfig {
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

function parseOverlayConfig(content: string): OverlayConfig | null {
  const match = content.match(/<<<OVERLAY_CONFIG>>>([\s\S]*?)<<<END_OVERLAY_CONFIG>>>/);
  if (!match) return null;

  try {
    const data = JSON.parse(match[1].trim());
    return {
      x: typeof data.x === "number" ? data.x : undefined,
      y: typeof data.y === "number" ? data.y : undefined,
      w: typeof data.w === "number" ? data.w : undefined,
      h: typeof data.h === "number" ? data.h : undefined,
    };
  } catch {
    return null;
  }
}

export function useAnimationChat({
  onCodeGenerated,
  currentCode,
  messages: controlledMessages = [],
  onMessagesChange,
  model
}: UseAnimationChatOptions = {}) {
  const messagesRef = useRef(controlledMessages);
  messagesRef.current = controlledMessages;

  const streamCallbacksRef = useRef<StreamCallbacks | null>(null);
  const retryCountRef = useRef(0);

  const updateMessages = useCallback((updater: Message[] | ((prev: Message[]) => Message[])) => {
    const newMessages = typeof updater === "function" ? updater(messagesRef.current) : updater;
    messagesRef.current = newMessages;
    const callback = streamCallbacksRef.current?.onMessagesChange ?? onMessagesChange;
    callback?.(newMessages);
  }, [onMessagesChange]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string, isAutoRetry = false, mentionedMedia?: MentionedMedia[]) => {
    // Skip isLoading check for auto-retries since we control the timing
    if (!content.trim() || (!isAutoRetry && isLoading)) return;

    // Reset retry count on new user-initiated messages
    if (!isAutoRetry) {
      retryCountRef.current = 0;
    }

    // Capture callbacks at stream start so layer switching doesn't lose data
    streamCallbacksRef.current = { onMessagesChange, onCodeGenerated };

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      mentionedMedia: mentionedMedia && mentionedMedia.length > 0 ? mentionedMedia : undefined,
    };

    updateMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messagesRef.current.map((m) => ({
            role: m.role === "question" ? "assistant" : m.role,
            content: m.content,
            mentionedMedia: m.mentionedMedia,
          })),
          currentCode,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate animation");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const assistantMessageId = crypto.randomUUID();

      updateMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        updateMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId ? { ...m, content: fullContent } : m
          )
        );
      }

      // Check if response contains questions
      const questions = parseQuestionResponse(fullContent);
      if (questions.length > 0) {
        updateMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, role: "question", questions, answeredIndices: [], content: questions.map(q => q.question).join("\n") }
              : m
          )
        );
      } else {
        // Extract and apply generated code
        const codeMatch = fullContent.match(/```tsx\n([\s\S]*?)```/);
        if (codeMatch) {
          const extractedCode = codeMatch[1].trim();
          const overlayConfig = parseOverlayConfig(fullContent);

          // Evaluate code to check for errors
          const { error } = evaluateAnimationCode(extractedCode);

          if (error && retryCountRef.current < MAX_RETRIES) {
            // Feedback loop: send error back to AI
            retryCountRef.current++;
            setIsLoading(false);

            // Automatically send error feedback
            setTimeout(() => {
              sendMessage(`The code has an error: "${error}". Please fix it and regenerate.`, true);
            }, 100);
          } else {
            // Code is valid or max retries reached
            retryCountRef.current = 0;
            streamCallbacksRef.current?.onCodeGenerated?.(extractedCode, overlayConfig ?? undefined);
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      updateMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error generating the animation. Please try again.",
      }]);
    } finally {
      setIsLoading(false);
      streamCallbacksRef.current = null;
    }
  }, [updateMessages, currentCode, isLoading, onMessagesChange, onCodeGenerated, model]);

  const pendingAnswersRef = useRef<Map<string, string[]>>(new Map());

  const answerQuestion = useCallback(
    (messageId: string, questionIndex: number, option: QuestionOption) => {
      const message = messagesRef.current.find(m => m.id === messageId);
      if (!message?.questions) return;

      const totalQuestions = message.questions.length;

      // Store the answer
      if (!pendingAnswersRef.current.has(messageId)) {
        pendingAnswersRef.current.set(messageId, new Array(totalQuestions).fill(""));
      }
      const answers = pendingAnswersRef.current.get(messageId)!;
      answers[questionIndex] = option.label;

      // Update answered indices
      const answeredIndices = [...answers.keys()].filter(i => answers[i] !== "");
      updateMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, answeredIndices } : m))
      );

      // If all questions answered, send combined response
      if (answeredIndices.length === totalQuestions) {
        const combinedAnswer = message.questions
          .map((q, i) => `${q.header || q.question}: ${answers[i]}`)
          .join("\n");
        pendingAnswersRef.current.delete(messageId);
        sendMessage(combinedAnswer);
      }
    },
    [sendMessage, updateMessages]
  );

  const handleSubmit = useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  return {
    messages: controlledMessages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleSubmit,
    answerQuestion,
  };
}
