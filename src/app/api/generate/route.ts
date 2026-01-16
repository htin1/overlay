import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { ANIMATION_SYSTEM_PROMPT, buildRefinementContext, buildMediaContext } from "@/lib/ai/prompts";
import { DEFAULT_AI_MODEL, type AIModelId } from "@/lib/constants";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

const MODEL_PROVIDERS: Record<AIModelId, () => ReturnType<typeof anthropic | typeof google>> = {
  "sonnet-4.5": () => anthropic("claude-sonnet-4-5"),
  "haiku-4.5": () => anthropic("claude-haiku-4-5"),
  "gemini-3-flash": () => google("gemini-3-flash-preview"),
  "gemini-3-pro": () => google("gemini-3-pro-preview"),
};

export async function POST(req: Request) {
  const { messages, currentCode, media, model: requestedModel } = await req.json();

  // Build system prompt, optionally including current code for refinement
  let systemPrompt = ANIMATION_SYSTEM_PROMPT;

  if (media && media.length > 0) {
    systemPrompt += "\n\n" + buildMediaContext(media as MediaItem[]);
  }

  if (currentCode) {
    systemPrompt += "\n\n" + buildRefinementContext(currentCode);
  }

  // Use requested model if valid, otherwise fall back to env var or default
  const modelKey: AIModelId = (requestedModel in MODEL_PROVIDERS)
    ? requestedModel
    : (process.env.AI_MODEL as AIModelId) ?? DEFAULT_AI_MODEL;
  const model = MODEL_PROVIDERS[modelKey];

  const result = streamText({
    model: model(),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
