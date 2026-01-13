import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";
import { ANIMATION_SYSTEM_PROMPT, buildRefinementContext, buildMediaContext } from "@/lib/ai/prompts";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}

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

  const result = streamText({
    model: anthropic("claude-sonnet-4.5"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
