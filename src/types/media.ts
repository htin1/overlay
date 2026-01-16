export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string;
}

export interface MentionedMedia {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
}
