"use client";

import { useState, useCallback } from "react";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  thumbnail?: string;
}

export function useMediaManager() {
  const [media, setMedia] = useState<MediaItem[]>([]);

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
