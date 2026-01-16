"use client";

import { useState, useCallback } from "react";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string;
}

const SAMPLE_MEDIA: MediaItem[] = [
  { id: "sample-1", name: "Sample 1", url: "/samples/sample1.jpg", type: "image" },
  { id: "sample-2", name: "Sample 2", url: "/samples/sample2.jpg", type: "image" },
  { id: "sample-3", name: "Sample 3", url: "/samples/sample3.jpg", type: "image" },
  { id: "sample-4", name: "Sample 4", url: "/samples/sample4.jpg", type: "image" },
  { id: "sample-5", name: "Sample 5", url: "/samples/sample5.jpg", type: "image" },
];

export function useMediaManager() {
  const [media, setMedia] = useState<MediaItem[]>(SAMPLE_MEDIA);

  const add = useCallback((item: MediaItem) => {
    setMedia((prev) => [...prev, item]);
  }, []);

  const remove = useCallback((id: string) => {
    setMedia((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    media,
    add,
    remove,
  };
}
