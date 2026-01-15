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

export interface Message {
  id: string;
  role: "user" | "assistant" | "question";
  content: string;
  questionData?: QuestionData;
  answered?: boolean;
}

export interface MediaContext {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

interface UseAnimationChatOptions {
  onCodeGenerated?: (code: string) => void;
  currentCode?: string;
  media?: MediaContext[];
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

interface StreamCallbacks {
  onMessagesChange: ((messages: Message[]) => void) | undefined;
  onCodeGenerated: ((code: string) => void) | undefined;
}

const MAX_RETRIES = 2; // Maximum automatic retry attempts for code errors

function parseQuestionResponse(content: string): QuestionData | null {
  const match = content.match(/<<<QUESTION_JSON>>>([\s\S]*?)<<<END_QUESTION_JSON>>>/);
  if (!match) return null;

  try {
    const data = JSON.parse(match[1].trim());
    return {
      header: data.header,
      question: data.question,
      options: data.options.map((opt: { label: string; description?: string }, idx: number) => ({
        id: `opt-${idx}`,
        label: opt.label,
        description: opt.description,
      })),
    };
  } catch {
    return null;
  }
}

export function useAnimationChat({
  onCodeGenerated,
  currentCode,
  media = [],
  messages: controlledMessages = [],
  onMessagesChange
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

  const sendMessage = useCallback(async (content: string, isAutoRetry = false) => {
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
          })),
          currentCode,
          media: media.length > 0 ? media : undefined,
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

      // Check if response contains a question
      const questionData = parseQuestionResponse(fullContent);
      if (questionData) {
        updateMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessageId
              ? { ...m, role: "question", questionData, content: questionData.question }
              : m
          )
        );
      } else {
        // Extract and apply generated code
        const codeMatch = fullContent.match(/```tsx\n([\s\S]*?)```/);
        if (codeMatch) {
          const extractedCode = codeMatch[1].trim();

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
            streamCallbacksRef.current?.onCodeGenerated?.(extractedCode);
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
  }, [updateMessages, currentCode, media, isLoading, onMessagesChange, onCodeGenerated]);

  const answerQuestion = useCallback(
    (questionId: string, option: QuestionOption) => {
      updateMessages((prev) =>
        prev.map((m) => (m.id === questionId ? { ...m, answered: true } : m))
      );
      sendMessage(option.label);
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
