import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { ANIMATION_SYSTEM_PROMPT, buildRefinementContext, buildMediaContext } from "@/lib/ai/prompts";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

const MODELS = {
  "sonnet-4.5": () => anthropic("claude-sonnet-4-5"),
  "haiku-4.5": () => anthropic("claude-haiku-4-5"),
  "gemini-3-flash": () => google("gemini-3-flash-preview"),
  "gemini-3-pro": () => google("gemini-3-pro-preview"),
}

const DEFAULT_MODEL = "gemini-3-flash";

export async function POST(req: Request) {
  const { messages, currentCode, media } = await req.json();

  // Build system prompt, optionally including current code for refinement
  let systemPrompt = ANIMATION_SYSTEM_PROMPT;

  if (media && media.length > 0) {
    systemPrompt += "\n\n" + buildMediaContext(media as MediaItem[]);
  }

  if (currentCode) {
    systemPrompt += "\n\n" + buildRefinementContext(currentCode);
  }

  const model = MODELS[process.env.AI_MODEL as keyof typeof MODELS] ?? MODELS[DEFAULT_MODEL];

  const result = streamText({
    model: model(),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
