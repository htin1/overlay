import type { CheerioAPI } from "cheerio";
import type { ExtractedText } from "@/types/website";

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500); // Limit length
}

export function extractText($: CheerioAPI): ExtractedText[] {
  const text: ExtractedText[] = [];
  const seen = new Set<string>();

  const addText = (item: ExtractedText) => {
    const normalized = item.content.toLowerCase();
    if (item.content.length > 2 && !seen.has(normalized)) {
      seen.add(normalized);
      text.push(item);
    }
  };

  // 1. Page title
  const title = $("title").text();
  if (title) {
    addText({ content: cleanText(title), type: "title" });
  }

  // 2. Open Graph title
  const ogTitle = $('meta[property="og:title"]').attr("content");
  if (ogTitle) {
    addText({ content: cleanText(ogTitle), type: "title" });
  }

  // 3. Meta description
  const metaDesc = $('meta[name="description"]').attr("content");
  if (metaDesc) {
    addText({ content: cleanText(metaDesc), type: "meta-description" });
  }

  // 4. Open Graph description
  const ogDesc = $('meta[property="og:description"]').attr("content");
  if (ogDesc) {
    addText({ content: cleanText(ogDesc), type: "meta-description" });
  }

  // 5. H1 headings
  $("h1").each((i, el) => {
    if (i >= 3) return; // Limit to first 3
    const content = cleanText($(el).text());
    if (content) {
      addText({ content, type: "h1" });
    }
  });

  // 6. Taglines (common patterns)
  const taglineSelectors = [
    ".tagline",
    ".slogan",
    ".subtitle",
    ".hero-text",
    ".hero p",
    "header p",
    ".lead",
    '[class*="tagline"]',
    '[class*="slogan"]',
  ];

  for (const selector of taglineSelectors) {
    $(selector).each((i, el) => {
      if (i >= 2) return; // Limit per selector
      const content = cleanText($(el).text());
      if (content && content.length > 10 && content.length < 200) {
        addText({ content, type: "tagline" });
      }
    });
  }

  // 7. First meaningful paragraph in hero/header area
  $("header p, .hero p, section:first-of-type p").each((i, el) => {
    if (i >= 2) return;
    const content = cleanText($(el).text());
    if (content && content.length > 20 && content.length < 300) {
      addText({ content, type: "tagline" });
    }
  });

  // Prioritize and limit results
  const priorityOrder: ExtractedText["type"][] = ["title", "h1", "tagline", "meta-description"];

  return text
    .sort((a, b) => priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type))
    .slice(0, 8);
}
