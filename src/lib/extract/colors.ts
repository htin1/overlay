import type { CheerioAPI } from "cheerio";
import type { ExtractedColor } from "@/types/website";

const HEX_REGEX = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g;
const RGB_REGEX = /rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/gi;
const RGBA_REGEX = /rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*[\d.]+\s*\)/gi;

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function normalizeHex(hex: string): string {
  hex = hex.toLowerCase();
  if (hex.length === 4) {
    return "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  return hex;
}

function extractColorsFromCSS(css: string, source: string): ExtractedColor[] {
  const colors: ExtractedColor[] = [];
  const seen = new Set<string>();

  // Extract hex colors
  const hexMatches = css.matchAll(HEX_REGEX);
  for (const match of hexMatches) {
    const hex = normalizeHex(match[0]);
    if (!seen.has(hex)) {
      seen.add(hex);
      colors.push({ hex, source });
    }
  }

  // Extract rgb colors
  const rgbMatches = css.matchAll(RGB_REGEX);
  for (const match of rgbMatches) {
    const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    if (!seen.has(hex)) {
      seen.add(hex);
      colors.push({ hex, source });
    }
  }

  // Extract rgba colors
  const rgbaMatches = css.matchAll(RGBA_REGEX);
  for (const match of rgbaMatches) {
    const hex = rgbToHex(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
    if (!seen.has(hex)) {
      seen.add(hex);
      colors.push({ hex, source });
    }
  }

  return colors;
}

export function extractColors($: CheerioAPI, html: string): ExtractedColor[] {
  const colors: ExtractedColor[] = [];
  const seen = new Set<string>();

  const addColor = (color: ExtractedColor) => {
    const hex = normalizeHex(color.hex);
    if (!seen.has(hex)) {
      seen.add(hex);
      colors.push({ ...color, hex });
    }
  };

  // 1. Extract from meta theme-color
  const themeColor = $('meta[name="theme-color"]').attr("content");
  if (themeColor && HEX_REGEX.test(themeColor)) {
    addColor({ hex: themeColor, name: "theme-color", source: "meta" });
  }

  // 2. Extract from CSS variables in style tags (prioritize brand/primary)
  $("style").each((_, el) => {
    const css = $(el).text();

    // Look for CSS variables with brand/primary names
    const varRegex = /--(primary|brand|accent|main|theme)[^:]*:\s*([^;]+);/gi;
    let match;
    while ((match = varRegex.exec(css)) !== null) {
      const value = match[2].trim();
      const hexMatch = value.match(HEX_REGEX);
      if (hexMatch) {
        addColor({ hex: hexMatch[0], name: match[1], source: "css-variable" });
      }
    }

    // Extract other colors from inline styles
    const cssColors = extractColorsFromCSS(css, "inline-css");
    cssColors.forEach(addColor);
  });

  // 3. Extract from inline style attributes
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    const cssColors = extractColorsFromCSS(style, "inline-style");
    cssColors.forEach(addColor);
  });

  // 4. Look for colors in link tags (manifest, etc)
  $('link[rel="mask-icon"]').each((_, el) => {
    const color = $(el).attr("color");
    if (color && HEX_REGEX.test(color)) {
      addColor({ hex: color, name: "mask-icon", source: "link" });
    }
  });

  // Filter out common non-brand colors (black, white, grays)
  const nonBrandColors = new Set([
    "#000000", "#ffffff", "#fff", "#000",
    "#111111", "#222222", "#333333", "#444444", "#555555",
    "#666666", "#777777", "#888888", "#999999", "#aaaaaa",
    "#bbbbbb", "#cccccc", "#dddddd", "#eeeeee", "#f5f5f5",
    "#fafafa", "#f0f0f0", "#e0e0e0", "#d0d0d0", "#c0c0c0",
  ]);

  // Return prioritized colors (branded first, then others)
  const brandedColors = colors.filter(c => c.source === "css-variable" || c.source === "meta");
  const otherColors = colors.filter(c =>
    c.source !== "css-variable" &&
    c.source !== "meta" &&
    !nonBrandColors.has(c.hex)
  );

  return [...brandedColors, ...otherColors].slice(0, 10);
}
