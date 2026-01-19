import type { CheerioAPI } from "cheerio";
import type { ExtractedImage } from "@/types/website";

function resolveUrl(url: string | undefined, baseUrl: string): string | null {
  if (!url) return null;
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return null;
  }
}

function isValidImageUrl(url: string): boolean {
  // Filter out data URIs, tracking pixels, etc.
  if (url.startsWith("data:")) return false;
  if (url.includes("1x1") || url.includes("pixel")) return false;
  if (url.includes("tracking") || url.includes("analytics")) return false;
  return true;
}

export function extractImages($: CheerioAPI, baseUrl: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  const seen = new Set<string>();

  const addImage = (image: ExtractedImage) => {
    if (!seen.has(image.url) && isValidImageUrl(image.url)) {
      seen.add(image.url);
      images.push(image);
    }
  };

  // 1. Open Graph image (highest priority for branding)
  const ogImage = $('meta[property="og:image"]').attr("content");
  const resolvedOgImage = resolveUrl(ogImage, baseUrl);
  if (resolvedOgImage) {
    addImage({ url: resolvedOgImage, type: "og-image", alt: "Open Graph Image" });
  }

  // 2. Twitter card image
  const twitterImage = $('meta[name="twitter:image"]').attr("content");
  const resolvedTwitterImage = resolveUrl(twitterImage, baseUrl);
  if (resolvedTwitterImage) {
    addImage({ url: resolvedTwitterImage, type: "og-image", alt: "Twitter Card Image" });
  }

  // 3. Favicons (multiple sizes)
  const faviconSelectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
  ];

  for (const selector of faviconSelectors) {
    $(selector).each((_, el) => {
      const href = $(el).attr("href");
      const resolved = resolveUrl(href, baseUrl);
      if (resolved) {
        addImage({ url: resolved, type: "favicon", alt: "Favicon" });
      }
    });
  }

  // 4. Logo images (by alt text or class)
  const logoSelectors = [
    'img[alt*="logo" i]',
    'img[class*="logo" i]',
    'img[id*="logo" i]',
    'img[src*="logo" i]',
    '.logo img',
    '#logo img',
    'header img',
    'nav img',
  ];

  for (const selector of logoSelectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr("src");
      const resolved = resolveUrl(src, baseUrl);
      if (resolved) {
        const alt = $(el).attr("alt") || "Logo";
        addImage({ url: resolved, type: "logo", alt });
      }
    });
  }

  // 5. SVG logos embedded inline
  $("header svg, nav svg, .logo svg").each((_, el) => {
    // For inline SVGs, we can't easily extract them as URLs
    // Skip for now - could convert to data URI in future
  });

  // 6. Hero/banner images
  const heroSelectors = [
    'img[class*="hero" i]',
    'img[class*="banner" i]',
    '.hero img',
    '.banner img',
    'section:first-of-type img',
  ];

  for (const selector of heroSelectors) {
    $(selector).each((_, el) => {
      const src = $(el).attr("src");
      const resolved = resolveUrl(src, baseUrl);
      if (resolved) {
        const alt = $(el).attr("alt") || "Hero Image";
        addImage({ url: resolved, type: "hero", alt });
      }
    });
  }

  // 7. Background images in inline styles
  $("[style*='background']").each((_, el) => {
    const style = $(el).attr("style") || "";
    const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/i);
    if (match) {
      const resolved = resolveUrl(match[1], baseUrl);
      if (resolved) {
        addImage({ url: resolved, type: "hero", alt: "Background Image" });
      }
    }
  });

  // Deduplicate by prioritizing certain types
  const priorityOrder: ExtractedImage["type"][] = ["og-image", "logo", "favicon", "hero"];

  return images
    .sort((a, b) => priorityOrder.indexOf(a.type) - priorityOrder.indexOf(b.type))
    .slice(0, 10);
}
