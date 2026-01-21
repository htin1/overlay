/**
 * Skills utility for loading agent skills from .agents/skills directory
 * Provides read functionality for skill rules
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

interface SkillRule {
  name: string;
  description: string;
  content: string;
}

interface SkillInfo {
  name: string;
  description: string;
  rules: string[];
}

const SKILLS_DIR = join(process.cwd(), ".agents/skills");

/**
 * Get list of available skills and their rules
 */
export function getAvailableSkills(): SkillInfo[] {
  if (!existsSync(SKILLS_DIR)) {
    return [];
  }

  const skills: SkillInfo[] = [];
  const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const skillName of skillDirs) {
    const skillPath = join(SKILLS_DIR, skillName);
    const skillMdPath = join(skillPath, "SKILL.md");
    const rulesPath = join(skillPath, "rules");

    if (!existsSync(skillMdPath)) continue;

    // Parse SKILL.md for description
    const skillMd = readFileSync(skillMdPath, "utf-8");
    const descMatch = skillMd.match(/description:\s*(.+)/);
    const description = descMatch?.[1] || skillName;

    // Get available rules
    const rules: string[] = [];
    if (existsSync(rulesPath)) {
      const ruleFiles = readdirSync(rulesPath)
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(".md", ""));
      rules.push(...ruleFiles);
    }

    skills.push({ name: skillName, description, rules });
  }

  return skills;
}

/**
 * Read a specific skill rule
 */
export function readSkillRule(skillName: string, ruleName: string): SkillRule | null {
  const rulePath = join(SKILLS_DIR, skillName, "rules", `${ruleName}.md`);

  if (!existsSync(rulePath)) {
    return null;
  }

  const content = readFileSync(rulePath, "utf-8");

  // Parse frontmatter for description
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let description = ruleName;
  if (frontmatterMatch) {
    const descMatch = frontmatterMatch[1].match(/description:\s*(.+)/);
    if (descMatch) {
      description = descMatch[1];
    }
  }

  return {
    name: ruleName,
    description,
    content,
  };
}

/**
 * Build context string for available skills to include in system prompt
 */
export function buildSkillsContext(): string {
  const skills = getAvailableSkills();
  if (skills.length === 0) return "";

  const parts: string[] = ["## Available Skills"];
  parts.push("You can use the `readSkillRule` tool to read detailed best practices for specific topics.\n");

  for (const skill of skills) {
    parts.push(`### ${skill.name}`);
    parts.push(`${skill.description}\n`);
    parts.push("Available rules:");
    for (const rule of skill.rules) {
      parts.push(`- ${rule}`);
    }
    parts.push("");
  }

  parts.push("**Usage**: Call `readSkillRule` with the skill name and rule name to get detailed guidance.");

  return parts.join("\n");
}

/**
 * Format skill rule for AI context
 */
export function formatSkillRule(rule: SkillRule | null, skillName: string, ruleName: string): string {
  if (!rule) {
    return `Rule "${ruleName}" not found in skill "${skillName}". Use readSkillRule with a valid rule name.`;
  }
  return `# ${rule.name}\n${rule.description}\n\n${rule.content}`;
}
