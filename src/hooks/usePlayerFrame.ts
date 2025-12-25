"use client";

import { PlayerRef } from "@remotion/player";
import { useCallback, useSyncExternalStore } from "react";

export function usePlayerFrame(ref: React.RefObject<PlayerRef | null>) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const { current } = ref;
      if (!current) {
        return () => undefined;
      }

      current.addEventListener("frameupdate", onStoreChange);
      return () => {
        current.removeEventListener("frameupdate", onStoreChange);
      };
    },
    [ref]
  );

  return useSyncExternalStore(
    subscribe,
    () => ref.current?.getCurrentFrame() ?? 0,
    () => 0
  );
}
