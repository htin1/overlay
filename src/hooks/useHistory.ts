import { useState, useCallback, useRef } from "react";

const MAX_HISTORY = 50;

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<T>(initialState);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof newState === "function" ? (newState as (prev: T) => T)(prev) : newState;
      // Only push to history if state actually changed
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        past.current = [...past.current.slice(-MAX_HISTORY + 1), prev];
        future.current = [];
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (past.current.length === 0) return;
    setState((current) => {
      const previous = past.current[past.current.length - 1];
      past.current = past.current.slice(0, -1);
      future.current = [current, ...future.current];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    if (future.current.length === 0) return;
    setState((current) => {
      const next = future.current[0];
      future.current = future.current.slice(1);
      past.current = [...past.current, current];
      return next;
    });
  }, []);

  return {
    state,
    set,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}
