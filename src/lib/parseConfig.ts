export type ConfigValueType = "string" | "number" | "color";

export interface ConfigEntry {
  key: string;
  value: string | number;
  type: ConfigValueType;
}

function detectType(value: string | number): ConfigValueType {
  if (typeof value === "number") return "number";
  if (typeof value === "string" && /^#[0-9a-fA-F]{3,8}$/.test(value)) return "color";
  return "string";
}

// Find CONFIG block boundaries
function findConfigBounds(code: string): { start: number; end: number } | null {
  const match = code.match(/const\s+CONFIG\s*=\s*\{/);
  if (!match) return null;

  const start = match.index! + match[0].length;
  let depth = 1;
  let end = start;

  for (let i = start; i < code.length && depth > 0; i++) {
    if (code[i] === "{" || code[i] === "[") depth++;
    else if (code[i] === "}" || code[i] === "]") depth--;
    end = i;
  }

  return { start, end };
}

export function parseConfig(code: string): ConfigEntry[] {
  if (!code) return [];

  const bounds = findConfigBounds(code);
  if (!bounds) return [];

  const configBody = code.slice(bounds.start, bounds.end);
  const entries: ConfigEntry[] = [];

  // Track nesting to only parse top-level properties
  let depth = 0;
  for (const line of configBody.split("\n")) {
    const atTopLevel = depth === 0;

    for (const char of line) {
      if (char === "{" || char === "[") depth++;
      else if (char === "}" || char === "]") depth--;
    }

    if (!atTopLevel) continue;

    // Match simple key: value (skip arrays/objects), allow trailing comments
    const match = line.match(/^\s*(\w+)\s*:\s*("[^"]*"|'[^']*'|-?\d+\.?\d*)\s*,?\s*(\/\/.*)?$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    const value = rawValue.startsWith('"') || rawValue.startsWith("'")
      ? rawValue.slice(1, -1)
      : parseFloat(rawValue);

    entries.push({ key, value, type: detectType(value) });
  }

  return entries;
}

export function updateConfigValue(code: string, key: string, newValue: string | number): string {
  if (!code) return code;
  const formatted = typeof newValue === "string" ? `"${newValue}"` : String(newValue);
  const regex = new RegExp(`(^\\s*${key}\\s*:\\s*)("[^"]*"|'[^']*'|-?\\d+\\.?\\d*)`, "m");
  return code.replace(regex, `$1${formatted}`);
}

export function parseDurationFrames(code: string): number | null {
  const config = parseConfig(code);
  const duration = config.find((e) => e.key === "durationFrames");
  if (duration && typeof duration.value === "number") {
    return duration.value;
  }
  return null;
}
