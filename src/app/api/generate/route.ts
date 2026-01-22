import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { streamText, tool, stepCountIs, type ImagePart, type TextPart } from "ai";
import { ANIMATION_SYSTEM_PROMPT, buildRefinementContext, buildMediaContext, buildBrandAssetsContext } from "@/lib/ai/prompts";
import { searchIcons, formatIconResults } from "@/lib/ai/icons";
import { readSkillRule, formatSkillRule, buildSkillsContext } from "@/lib/ai/skills";
import { generateSchema, askQuestionsSchema, searchIconsSchema, readSkillRuleSchema } from "@/lib/ai/tools";
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

async function fetchImageAsBase64(url: string, baseUrl: string): Promise<string | null> {
  try {
    if (url.startsWith("data:")) {
      return url;
    }

    // Convert relative URLs to absolute
    const absoluteUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
    const response = await fetch(absoluteUrl);
    if (!response.ok) {
      console.warn(`Failed to fetch image: ${absoluteUrl} (${response.status})`);
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

async function buildMultimodalMessages(messages: IncomingMessage[], baseUrl: string): Promise<ProcessedMessage[]> {
  const result: ProcessedMessage[] = [];

  for (const msg of messages) {
    if (msg.role === "user" && msg.mentionedMedia && msg.mentionedMedia.length > 0) {
      // Build multimodal content array with images + text
      const content: (ImagePart | TextPart)[] = [];

      // Fetch all images in parallel
      const imageMedia = msg.mentionedMedia.filter((m) => m.type === "image");
      const imagePromises = imageMedia.map((m) => fetchImageAsBase64(m.url, baseUrl));
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
  "opus-4.5": () => anthropic("claude-opus-4-5"),
  "gemini-3-flash": () => google("gemini-3-flash-preview"),
  "gemini-3-pro": () => google("gemini-3-pro-preview"),
};

interface BrandAssets {
  url: string;
  domain: string;
  colors: { hex: string; name?: string; source: string }[];
  images: { url: string; alt?: string; type: string }[];
  text: { content: string; type: string }[];
}

export async function POST(req: Request) {
  const body = await req.json();
  const messages = body.messages as IncomingMessage[];
  const currentCode = body.currentCode as string | undefined;
  const requestedModel = body.model as string | undefined;
  const brandAssets = body.brandAssets as BrandAssets | undefined;

  // Extract base URL from request for fetching relative URLs
  const url = new URL(req.url);
  const baseUrl = `${url.protocol}//${url.host}`;

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

  // Add skills context so the agent knows what's available
  const skillsContext = buildSkillsContext();
  if (skillsContext) {
    systemPrompt += "\n\n" + skillsContext;
  }

  if (brandAssets) {
    systemPrompt += "\n\n" + buildBrandAssetsContext(brandAssets);
  }

  if (allMentionedMedia.length > 0) {
    systemPrompt += "\n\n" + buildMediaContext(allMentionedMedia);
  }

  if (currentCode) {
    systemPrompt += "\n\n" + buildRefinementContext(currentCode);
  }

  // Use requested model if valid, otherwise fall back to env var or default
  const modelKey: AIModelId = (requestedModel && requestedModel in MODEL_PROVIDERS)
    ? requestedModel as AIModelId
    : (process.env.AI_MODEL as AIModelId) ?? DEFAULT_AI_MODEL;
  const model = MODEL_PROVIDERS[modelKey];

  // Build multimodal messages (includes base64 images for vision)
  const processedMessages = await buildMultimodalMessages(messages as IncomingMessage[], baseUrl);

  const result = streamText({
    model: model(),
    system: systemPrompt,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: processedMessages as any,
    tools: {
      generate: tool({
        description: "Generate animation code. Use this when you have enough context to create or modify the animation.",
        inputSchema: generateSchema,
      }),
      askQuestions: tool({
        description: "Ask clarifying questions before generating. Use this when the request is vague or missing key details like duration, style, or content.",
        inputSchema: askQuestionsSchema,
      }),
      searchIcons: tool({
        description: "Search for icons across react-icons libraries (si for brands, fa6, md, hi2, tb, bs, io5, ri, vsc, gi). Use when unsure of exact icon name.",
        inputSchema: searchIconsSchema,
        execute: ({ query }: { query: string }) => {
          return formatIconResults(searchIcons(query, { limit: 10 }));
        },
      }),
      readSkillRule: tool({
        description: "Read a detailed best practices rule from available skills. Use when you need specific guidance on Remotion patterns like timing, sequencing, transitions, etc.",
        inputSchema: readSkillRuleSchema,
        execute: ({ skillName, ruleName }: { skillName: string; ruleName: string }) => {
          const rule = readSkillRule(skillName, ruleName);
          return formatSkillRule(rule, skillName, ruleName);
        },
      }),
    },
    stopWhen: stepCountIs(5),
  });

  // Create custom stream that includes tool call markers
  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            controller.enqueue(encoder.encode(`0:${JSON.stringify(part.text)}\n`));
          } else if (part.type === "tool-call") {
            // Stream the tool call with its arguments
            controller.enqueue(encoder.encode(`9:${JSON.stringify({
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              args: "args" in part ? part.args : part.input
            })}\n`));
          } else if (part.type === "tool-result") {
            // Stream the tool result
            controller.enqueue(encoder.encode(`a:${JSON.stringify({
              toolCallId: part.toolCallId,
              toolName: part.toolName,
              result: "result" in part ? part.result : undefined,
            })}\n`));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(customStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
