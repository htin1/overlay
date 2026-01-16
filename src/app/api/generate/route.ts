import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamText, type ImagePart, type TextPart } from "ai";
import { ANIMATION_SYSTEM_PROMPT, buildRefinementContext, buildMediaContext } from "@/lib/ai/prompts";
import { DEFAULT_AI_MODEL, type AIModelId } from "@/lib/constants";
import type { MentionedMedia } from "@/types/media";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
  mentionedMedia?: MentionedMedia[];
}

type MessageContent = string | (ImagePart | TextPart)[];

interface ProcessedMessage {
  role: "user" | "assistant";
  content: MessageContent;
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${url} (${response.status})`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "image/png";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Failed to fetch image:", url, error);
    return null;
  }
}

async function buildMultimodalMessages(messages: IncomingMessage[]): Promise<ProcessedMessage[]> {
  const result: ProcessedMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "user" && msg.mentionedMedia && msg.mentionedMedia.length > 0) {
      // Build multimodal content array with images + text
      const content: (ImagePart | TextPart)[] = [];

      // Fetch all images in parallel
      const imageMedia = msg.mentionedMedia.filter((m) => m.type === "image");
      const imagePromises = imageMedia.map((m) => fetchImageAsBase64(m.url));
      const images = await Promise.all(imagePromises);

      // Add successfully fetched images
      for (const base64 of images) {
        if (base64) {
          content.push({ type: "image", image: base64 });
        }
      }

      // Add the user's text
      content.push({
        type: "text",
        text: msg.content,
      });

      result.push({
        role: "user",
        content,
      });
    } else {
      // Regular text message
      result.push({
        role: msg.role,
        content: msg.content,
      });
    }
  }

  return result;
}

const MODEL_PROVIDERS: Record<AIModelId, () => ReturnType<typeof anthropic | typeof google | typeof openai>> = {
  "sonnet-4.5": () => anthropic("claude-sonnet-4-5"),
  "haiku-4.5": () => anthropic("claude-haiku-4-5"),
  "gemini-3-flash": () => google("gemini-3-flash-preview"),
  "gemini-3-pro": () => google("gemini-3-pro-preview"),
  "gpt-5.2": () => openai("gpt-5.2"),
};

export async function POST(req: Request) {
  const { messages, currentCode, model: requestedModel } = await req.json();

  // Collect all mentioned media from messages for URL context
  const allMentionedMedia: MentionedMedia[] = [];
  for (const msg of messages as IncomingMessage[]) {
    if (msg.mentionedMedia) {
      for (const media of msg.mentionedMedia) {
        if (!allMentionedMedia.some(m => m.id === media.id)) {
          allMentionedMedia.push(media);
        }
      }
    }
  }

  // Build system prompt with mentioned media URLs as context
  let systemPrompt = ANIMATION_SYSTEM_PROMPT;

  if (allMentionedMedia.length > 0) {
    systemPrompt += "\n\n" + buildMediaContext(allMentionedMedia);
  }

  if (currentCode) {
    systemPrompt += "\n\n" + buildRefinementContext(currentCode);
  }

  // Use requested model if valid, otherwise fall back to env var or default
  const modelKey: AIModelId = (requestedModel in MODEL_PROVIDERS)
    ? requestedModel
    : (process.env.AI_MODEL as AIModelId) ?? DEFAULT_AI_MODEL;
  const model = MODEL_PROVIDERS[modelKey];

  // Build multimodal messages (includes base64 images for vision)
  const processedMessages = await buildMultimodalMessages(messages as IncomingMessage[]);

  const result = streamText({
    model: model(),
    system: systemPrompt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: processedMessages as any,
  });

  return result.toTextStreamResponse();
}
