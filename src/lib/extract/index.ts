import * as cheerio from "cheerio";
import { extractColors } from "./colors";
import { extractImages } from "./images";
import { extractText } from "./text";
import type { WebsiteExtraction } from "@/types/website";

const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT = 15000; // 15 seconds

// Private IP ranges to block (SSRF prevention)
const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^127\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/,
  /^fe80:/,
  /^localhost$/i,
];

function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    for (const pattern of PRIVATE_IP_PATTERNS) {
      if (pattern.test(hostname)) {
        return true;
      }
    }

    return false;
  } catch {
    return true; // Invalid URL, block it
  }
}

function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);

    // Only allow http/https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: "Only HTTP and HTTPS URLs are allowed" };
    }

    // Block private IPs
    if (isPrivateUrl(url)) {
      return { valid: false, error: "Private/local URLs are not allowed" };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

export async function extractFromWebsite(url: string): Promise<WebsiteExtraction> {
  // Validate URL
  const validation = validateUrl(url);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Ensure URL has protocol
  let normalizedUrl = url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    normalizedUrl = `https://${url}`;
  }

  // Fetch with timeout and size limit
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; OverlayBot/1.0; +https://overlay.app)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    // Check content length
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_RESPONSE_SIZE) {
      throw new Error("Response too large (max 5MB)");
    }

    // Read response with size limit
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.length;
      if (totalSize > MAX_RESPONSE_SIZE) {
        reader.cancel();
        throw new Error("Response too large (max 5MB)");
      }

      chunks.push(value);
    }

    const html = new TextDecoder().decode(
      new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
        .map((_, i) => {
          let offset = 0;
          for (const chunk of chunks) {
            if (i < offset + chunk.length) {
              return chunk[i - offset];
            }
            offset += chunk.length;
          }
          return 0;
        })
    );

    // Parse HTML
    const $ = cheerio.load(html);

    // Extract domain
    const parsed = new URL(normalizedUrl);
    const domain = parsed.hostname;

    // Run extractions in parallel
    const [colors, images, text] = await Promise.all([
      Promise.resolve(extractColors($, html)),
      Promise.resolve(extractImages($, normalizedUrl)),
      Promise.resolve(extractText($)),
    ]);

    return {
      url: normalizedUrl,
      domain,
      colors,
      images,
      text,
    };
  } catch (error) {
    clearTimeout(timeout);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timed out (15s limit)");
      }
      throw error;
    }

    throw new Error("Failed to extract website data");
  }
}
