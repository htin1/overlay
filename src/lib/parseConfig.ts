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

export function parseConfig(code: string): ConfigEntry[] {
  if (!code) return [];

  // Match CONFIG object: const CONFIG = { ... };
  const configMatch = code.match(/const\s+CONFIG\s*=\s*\{([^}]+)\}/);
  if (!configMatch) return [];

  const configBody = configMatch[1];
  const entries: ConfigEntry[] = [];

  // Parse line by line to avoid matching content inside strings
  const lines = configBody.split("\n");
  for (const line of lines) {
    // Match property definition at start of line: key: value
    const match = line.match(/^\s*(\w+)\s*:\s*("[^"]*"|'[^']*'|-?\d+\.?\d*)\s*,?\s*$/);
    if (!match) continue;

    const key = match[1];
    const rawValue = match[2];

    // Parse the value
    let value: string | number;
    if (rawValue.startsWith('"') || rawValue.startsWith("'")) {
      value = rawValue.slice(1, -1);
    } else {
      value = parseFloat(rawValue);
    }

    entries.push({
      key,
      value,
      type: detectType(value),
    });
  }

  return entries;
}

export function updateConfigValue(code: string, key: string, newValue: string | number): string {
  if (!code) return code;

  // Format the new value for code
  const formattedValue = typeof newValue === "string" ? `"${newValue}"` : String(newValue);

  // Match and replace the specific key in CONFIG
  const regex = new RegExp(`(const\\s+CONFIG\\s*=\\s*\\{[^}]*${key}\\s*:\\s*)("[^"]*"|'[^']*'|-?\\d+\\.?\\d*)`, "s");

  return code.replace(regex, `$1${formattedValue}`);
}
