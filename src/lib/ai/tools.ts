import { z } from "zod";

// Shared config schema for overlay position/size
const overlayConfigSchema = z.object({
  x: z.number().min(0).max(100).optional().describe("X position as percentage from left (0-100)"),
  y: z.number().min(0).max(100).optional().describe("Y position as percentage from top (0-100)"),
  w: z.number().min(1).max(100).optional().describe("Width as percentage of canvas (1-100)"),
  h: z.number().min(1).max(100).optional().describe("Height as percentage of canvas (1-100)"),
}).optional();

// Tool 1: Generate animation code
export const generateSchema = z.object({
  code: z.string().describe("Complete TSX animation code including imports, CONFIG object, and Animation function"),
  config: overlayConfigSchema.describe("Overlay position and size configuration"),
});

export type GenerateResult = z.infer<typeof generateSchema>;

// Tool 2: Ask clarifying questions
export const askQuestionsSchema = z.object({
  questions: z.array(z.object({
    header: z.string().describe("Short category label (e.g., 'Duration', 'Style', 'Colors')"),
    question: z.string().describe("The question to ask the user"),
    options: z.array(z.object({
      label: z.string().describe("Option label shown to user"),
      description: z.string().optional().describe("Brief description of what this option means"),
    })).min(2).max(5).describe("Available options for the user to choose from"),
  })).min(1).max(4).describe("Array of questions to ask"),
});

export type AskQuestionsResult = z.infer<typeof askQuestionsSchema>;

// Tool 3: Search icons (already exists in icons.ts, but define schema here for consistency)
export const searchIconsSchema = z.object({
  query: z.string().describe("Icon or brand name to search (e.g., 'github', 'slack', 'arrow')"),
});

export type SearchIconsResult = z.infer<typeof searchIconsSchema>;

// Tool 4: Read skill rule for detailed best practices
export const readSkillRuleSchema = z.object({
  skillName: z.string().describe("The skill name (e.g., 'remotion-best-practices')"),
  ruleName: z.string().describe("The rule name without .md extension (e.g., 'timing', 'sequencing', 'spring')"),
});

export type ReadSkillRuleResult = z.infer<typeof readSkillRuleSchema>;

// Tool 5: Edit existing animation code with targeted string replacements
export const editSchema = z.object({
  edits: z.array(z.object({
    oldString: z.string().describe("Exact string to find in current code (copy exactly, whitespace matters)"),
    newString: z.string().describe("Replacement string"),
  })).min(1).max(10).describe("Array of string replacements to apply"),
  config: overlayConfigSchema.describe("Optional position/size changes"),
});

export type EditResult = z.infer<typeof editSchema>;
