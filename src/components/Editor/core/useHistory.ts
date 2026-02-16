/**
 * @file History Hook
 *
 * Manages undo/redo history with debounced grouping.
 * Groups rapid keystrokes into single undo units.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { HistoryState } from "./types";

// =============================================================================
// Types
// =============================================================================

export type UseHistoryConfig = {
  /** Debounce delay in milliseconds */
  readonly debounceMs: number;
  /** Maximum history size */
  readonly maxHistory?: number;
};

export type HistoryEntry<T> = {
  /** State value */
  readonly state: T;
  /** Cursor offset */
  readonly cursorOffset: number;
};

export type UseHistoryResult<T> = {
  /** Current state */
  readonly current: T;
  /** Current cursor offset */
  readonly cursorOffset: number;
  /** Push new state (creates undo point if debounced) */
  readonly push: (state: T, cursorOffset: number) => void;
  /** Undo to previous state, returns the restored entry or undefined if none */
  readonly undo: () => HistoryEntry<T> | undefined;
  /** Redo to next state, returns the restored entry or undefined if none */
  readonly redo: () => HistoryEntry<T> | undefined;
  /** Whether undo is available */
  readonly canUndo: boolean;
  /** Whether redo is available */
  readonly canRedo: boolean;
  /** Flush pending debounce */
  readonly flush: () => void;
  /** Reset history with new initial state */
  readonly reset: (state: T, cursorOffset: number) => void;
};

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_MAX_HISTORY = 100;

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook that manages undo/redo history with debounced grouping.
 *
 * Strategy:
 * - First change in a batch: creates new undo point
 * - Subsequent changes within debounce window: updates current state only
 * - After debounce timeout: reset batch state for next batch
 *
 * This ensures typing "abc" quickly creates one undo point, and undo reverts all three characters.
 *
 * @param initialState - Initial state value
 * @param initialCursorOffset - Initial cursor offset
 * @param config - Configuration for debounce and max history
 * @returns History state and control functions
 *
 * @example
 * ```tsx
 * const history = useHistory(initialText, 0, { debounceMs: 300 });
 *
 * // On text change:
 * history.push(newText, cursorOffset);
 *
 * // On undo:
 * history.undo();
 * // Use history.current to get current text
 * ```
 */
export function useHistory<T>(
  initialState: T,
  initialCursorOffset: number,
  config: UseHistoryConfig
): UseHistoryResult<T> {
  const { debounceMs, maxHistory = DEFAULT_MAX_HISTORY } = config;

  const [historyState, setHistoryState] = useState<HistoryState<T>>({
    past: [],
    present: { state: initialState, cursorOffset: initialCursorOffset },
    future: [],
  });

  // Track the latest historyState synchronously to avoid stale closure issues.
  // This is necessary because undo/redo may be called immediately after push,
  // before React has re-rendered with the new state.
  const historyStateRef = useRef<HistoryState<T>>(historyState);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const batchStartedRef = useRef(false);

  const flush = useCallback(() => {
    // Clear pending timer
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    // Reset batch state
    batchStartedRef.current = false;
  }, []);

  const push = useCallback(
    (state: T, cursorOffset: number) => {
      // Clear existing timer
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      const computeNextState = (
        prev: HistoryState<T>,
        entry: { state: T; cursorOffset: number }
      ): HistoryState<T> => {
        if (!batchStartedRef.current) {
          // First change in batch - create undo point
          batchStartedRef.current = true;
          const newPast = [...prev.past, prev.present];
          // Trim history if exceeds max
          if (newPast.length > maxHistory) {
            newPast.shift();
          }
          return {
            past: newPast,
            present: entry,
            future: [], // Clear redo stack on new changes
          };
        }
        // Subsequent changes - just update present
        return {
          ...prev,
          present: entry,
          future: [], // Clear redo stack on new changes
        };
      };

      setHistoryState((prev) => {
        const newState = computeNextState(prev, { state, cursorOffset });
        // Synchronously update ref so undo/redo can read latest state
        historyStateRef.current = newState;
        return newState;
      });

      // Schedule batch reset after debounce
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        batchStartedRef.current = false;
      }, debounceMs);
    },
    [debounceMs, maxHistory]
  );

  const undo = useCallback((): HistoryEntry<T> | undefined => {
    flush(); // Ensure any pending changes are committed

    // Read from ref to get the latest state (avoids stale closure issue)
    const currentState = historyStateRef.current;
    if (currentState.past.length === 0) {
      return undefined;
    }

    const restoredEntry = currentState.past[currentState.past.length - 1];

    setHistoryState((prev) => {
      if (prev.past.length === 0) {
        return prev;
      }

      const newState: HistoryState<T> = {
        past: prev.past.slice(0, -1),
        present: prev.past[prev.past.length - 1],
        future: [prev.present, ...prev.future],
      };
      historyStateRef.current = newState;
      return newState;
    });

    return restoredEntry;
  }, [flush]);

  const redo = useCallback((): HistoryEntry<T> | undefined => {
    flush(); // Ensure any pending changes are committed

    // Read from ref to get the latest state (avoids stale closure issue)
    const currentState = historyStateRef.current;
    if (currentState.future.length === 0) {
      return undefined;
    }

    const restoredEntry = currentState.future[0];

    setHistoryState((prev) => {
      if (prev.future.length === 0) {
        return prev;
      }

      const newState: HistoryState<T> = {
        past: [...prev.past, prev.present],
        present: prev.future[0],
        future: prev.future.slice(1),
      };
      historyStateRef.current = newState;
      return newState;
    });

    return restoredEntry;
  }, [flush]);

  const reset = useCallback((state: T, cursorOffset: number) => {
    flush();
    const newState: HistoryState<T> = {
      past: [],
      present: { state, cursorOffset },
      future: [],
    };
    historyStateRef.current = newState;
    setHistoryState(newState);
  }, [flush]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    current: historyState.present.state,
    cursorOffset: historyState.present.cursorOffset,
    push,
    undo,
    redo,
    canUndo: historyState.past.length > 0,
    canRedo: historyState.future.length > 0,
    flush,
    reset,
  };
}
