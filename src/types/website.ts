export interface ExtractedColor {
  hex: string;
  name?: string;
  source: string;
}

export interface ExtractedImage {
  url: string;
  alt?: string;
  type: "logo" | "hero" | "favicon" | "og-image";
}

export interface ExtractedText {
  content: string;
  type: "title" | "h1" | "tagline" | "meta-description";
}

export interface WebsiteExtraction {
  url: string;
  domain: string;
  colors: ExtractedColor[];
  images: ExtractedImage[];
  text: ExtractedText[];
}
