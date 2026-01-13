"use client";

import { useState, useCallback } from "react";

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
}

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

export function useAnimationChat({ onCodeGenerated, currentCode, media = [] }: UseAnimationChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
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

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: fullContent } : m
          )
        );
      }

      // Check if response contains a question
      const questionData = parseQuestionResponse(fullContent);
      if (questionData) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, role: "question", questionData, content: questionData.question }
              : m
          )
        );
      } else {
        // Extract code from the response
        const codeMatch = fullContent.match(/```tsx\n([\s\S]*?)```/);
        if (codeMatch && onCodeGenerated) {
          onCodeGenerated(codeMatch[1].trim());
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I encountered an error generating the animation. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, currentCode, media, onCodeGenerated, isLoading]);

  const answerQuestion = useCallback(
    (questionId: string, option: QuestionOption) => {
      // Mark the question as answered
      setMessages((prev) =>
        prev.map((m) => (m.id === questionId ? { ...m, answered: true } : m))
      );

      // Send the selected option as a user message
      sendMessage(option.label);
    },
    [sendMessage]
  );

  const handleSubmit = useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      sendMessage(input);
    },
    [input, sendMessage]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    handleSubmit,
    answerQuestion,
  };
}
