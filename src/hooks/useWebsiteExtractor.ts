"use client";

import { useState, useCallback } from "react";
import type { WebsiteExtraction } from "@/types/website";

interface UseWebsiteExtractorResult {
  extraction: WebsiteExtraction | null;
  isLoading: boolean;
  error: string | null;
  extract: (url: string) => Promise<WebsiteExtraction | null>;
  reset: () => void;
}

export function useWebsiteExtractor(): UseWebsiteExtractorResult {
  const [extraction, setExtraction] = useState<WebsiteExtraction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extract = useCallback(async (url: string): Promise<WebsiteExtraction | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/extract-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to extract website data");
      }

      setExtraction(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to extract website data";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setExtraction(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    extraction,
    isLoading,
    error,
    extract,
    reset,
  };
}
