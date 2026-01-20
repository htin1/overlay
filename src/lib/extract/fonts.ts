import type { CheerioAPI } from "cheerio";

const FONT_FAMILY_REGEX = /font-family:\s*['"]?([^;'"}\n]+)['"]?\s*[;}\n]/gi;

const SYSTEM_FONTS = new Set([
  "arial", "helvetica", "verdana", "georgia", "times", "times new roman",
  "courier", "courier new", "sans-serif", "serif", "monospace", "system-ui",
  "-apple-system", "blinkmacsystemfont", "segoe ui", "inherit", "initial",
]);

function cleanFontName(name: string): string | null {
  const cleaned = name
    .split(",")[0]
    .replace(/['"`]/g, "")
    .replace(/:wght@[\d;]+/, "")
    .replace(/\+/g, " ")
    .trim();
  // Skip CSS variables and empty names
  if (!cleaned || cleaned.startsWith("var(")) return null;
  return cleaned;
}

export function extractFonts($: CheerioAPI): string[] {
  const fonts = new Set<string>();

  // Extract from all style content
  $("style").each((_, el) => {
    const css = $(el).text();
    let match;
    while ((match = FONT_FAMILY_REGEX.exec(css)) !== null) {
      const name = cleanFontName(match[1]);
      if (name && !SYSTEM_FONTS.has(name.toLowerCase())) fonts.add(name);
    }
  });

  // Extract from Google Fonts links
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr("href") || "";
    const families = href.match(/family=([^&]+)/g);
    families?.forEach((f) => {
      const name = cleanFontName(decodeURIComponent(f.replace("family=", "")));
      if (name) fonts.add(name);
    });
  });

  return Array.from(fonts).slice(0, 10);
}
