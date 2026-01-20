import * as cheerio from "cheerio";
import { extractColors } from "./colors";
import { extractFonts } from "./fonts";
import { extractImages } from "./images";
import { extractText } from "./text";
import type { WebsiteExtraction } from "@/types/website";

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT = 15000; // 15s

const PRIVATE_HOST_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /^localhost$/i,
];

function normalizeUrl(url: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
}

function validateUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Only HTTP and HTTPS URLs are allowed";
    }

    if (PRIVATE_HOST_PATTERNS.some((p) => p.test(parsed.hostname))) {
      return "Private/local URLs are not allowed";
    }

    return null;
  } catch {
    return "Invalid URL format";
  }
}

export async function extractFromWebsite(url: string): Promise<WebsiteExtraction> {
  const normalizedUrl = normalizeUrl(url);

  const error = validateUrl(normalizedUrl);
  if (error) throw new Error(error);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OverlayBot/1.0)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      throw new Error("Response too large (max 5MB)");
    }

    const html = await response.text();
    if (html.length > MAX_RESPONSE_SIZE) {
      throw new Error("Response too large (max 5MB)");
    }

    const $ = cheerio.load(html);
    const domain = new URL(normalizedUrl).hostname;

    return {
      url: normalizedUrl,
      domain,
      colors: extractColors($, html),
      fonts: extractFonts($),
      images: extractImages($, normalizedUrl),
      text: extractText($),
    };
  } catch (err) {
    clearTimeout(timeout);

    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out (15s limit)");
      }
      throw err;
    }

    throw new Error("Failed to extract website data");
  }
}
