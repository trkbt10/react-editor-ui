/**
 * @file Generic History Hook
 *
 * Manages undo/redo history with debounced grouping.
 * Groups rapid changes into single undo units.
 */

import { useCallback, useEffect, useRef, useState } from "react";

// =============================================================================
// Types
// =============================================================================

export type UseHistoryConfig = {
  /** Debounce delay in milliseconds (default: 300) */
  readonly debounceMs?: number;
  /** Maximum history size (default: 100) */
  readonly maxHistory?: number;
};

export type HistoryEntry<T, M = undefined> = {
  /** State value */
  readonly state: T;
  /** Optional metadata (selection state, viewport position, etc.) */
  readonly metadata?: M;
};

type HistoryState<T, M> = {
  readonly past: readonly HistoryEntry<T, M>[];
  readonly present: HistoryEntry<T, M>;
  readonly future: readonly HistoryEntry<T, M>[];
};

export type UseHistoryResult<T, M = undefined> = {
  /** Current state */
  readonly state: T;
  /** Current metadata */
  readonly metadata: M | undefined;
  /** Push new state (creates undo point if debounced) */
  readonly push: (state: T, metadata?: M) => void;
  /** Replace current state without creating undo point */
  readonly replace: (state: T, metadata?: M) => void;
  /** Undo to previous state */
  readonly undo: () => HistoryEntry<T, M> | undefined;
  /** Redo to next state */
  readonly redo: () => HistoryEntry<T, M> | undefined;
  /** Whether undo is available */
  readonly canUndo: boolean;
  /** Whether redo is available */
  readonly canRedo: boolean;
  /** Flush pending debounce */
  readonly flush: () => void;
  /** Reset history with new initial state */
  readonly reset: (state: T, metadata?: M) => void;
};

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_MAX_HISTORY = 100;

// =============================================================================
// Helper Functions
// =============================================================================

function computePushState<T, M>(
  prev: HistoryState<T, M>,
  entry: HistoryEntry<T, M>,
  createUndoPoint: boolean,
  maxHistory: number
): HistoryState<T, M> {
  if (!createUndoPoint) {
    // Subsequent changes - just update present
    return {
      ...prev,
      present: entry,
      future: [], // Clear redo stack on new changes
    };
  }

  // First change in batch - create undo point
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
 * @param initialState - Initial state value
 * @param config - Configuration for debounce and max history
 * @returns History state and control functions
 *
 * @example
 * ```tsx
 * const history = useHistory(initialDocument, { debounceMs: 300 });
 *
 * // On document change:
 * history.push(newDocument, { selection: selectedIds });
 *
 * // On undo:
 * const entry = history.undo();
 * if (entry) {
 *   setDocument(entry.state);
 *   setSelection(entry.metadata?.selection);
 * }
 * ```
 */
export function useHistory<T, M = undefined>(
  initialState: T,
  config: UseHistoryConfig = {}
): UseHistoryResult<T, M> {
  const {
    debounceMs = DEFAULT_DEBOUNCE_MS,
    maxHistory = DEFAULT_MAX_HISTORY,
  } = config;

  const [historyState, setHistoryState] = useState<HistoryState<T, M>>({
    past: [],
    present: { state: initialState },
    future: [],
  });

  // Track the latest historyState synchronously to avoid stale closure issues.
  const historyStateRef = useRef<HistoryState<T, M>>(historyState);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const batchStartedRef = useRef(false);

  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    batchStartedRef.current = false;
  }, []);

  const push = useCallback(
    (state: T, metadata?: M) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }

      const shouldCreateUndoPoint = !batchStartedRef.current;
      if (shouldCreateUndoPoint) {
        batchStartedRef.current = true;
      }

      const entry: HistoryEntry<T, M> = { state, metadata };

      setHistoryState((prev) => {
        const newState = computePushState(
          prev,
          entry,
          shouldCreateUndoPoint,
          maxHistory
        );
        historyStateRef.current = newState;
        return newState;
      });

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        batchStartedRef.current = false;
      }, debounceMs);
    },
    [debounceMs, maxHistory]
  );

  const replace = useCallback((state: T, metadata?: M) => {
    const entry: HistoryEntry<T, M> = { state, metadata };
    setHistoryState((prev) => {
      const newState: HistoryState<T, M> = {
        ...prev,
        present: entry,
      };
      historyStateRef.current = newState;
      return newState;
    });
  }, []);

  const undo = useCallback((): HistoryEntry<T, M> | undefined => {
    flush();

    const currentState = historyStateRef.current;
    if (currentState.past.length === 0) {
      return undefined;
    }

    const restoredEntry = currentState.past[currentState.past.length - 1];

    setHistoryState((prev) => {
      if (prev.past.length === 0) {
        return prev;
      }

      const newState: HistoryState<T, M> = {
        past: prev.past.slice(0, -1),
        present: prev.past[prev.past.length - 1],
        future: [prev.present, ...prev.future],
      };
      historyStateRef.current = newState;
      return newState;
    });

    return restoredEntry;
  }, [flush]);

  const redo = useCallback((): HistoryEntry<T, M> | undefined => {
    flush();

    const currentState = historyStateRef.current;
    if (currentState.future.length === 0) {
      return undefined;
    }

    const restoredEntry = currentState.future[0];

    setHistoryState((prev) => {
      if (prev.future.length === 0) {
        return prev;
      }

      const newState: HistoryState<T, M> = {
        past: [...prev.past, prev.present],
        present: prev.future[0],
        future: prev.future.slice(1),
      };
      historyStateRef.current = newState;
      return newState;
    });

    return restoredEntry;
  }, [flush]);

  const reset = useCallback(
    (state: T, metadata?: M) => {
      flush();
      const newState: HistoryState<T, M> = {
        past: [],
        present: { state, metadata },
        future: [],
      };
      historyStateRef.current = newState;
      setHistoryState(newState);
    },
    [flush]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    state: historyState.present.state,
    metadata: historyState.present.metadata,
    push,
    replace,
    undo,
    redo,
    canUndo: historyState.past.length > 0,
    canRedo: historyState.future.length > 0,
    flush,
    reset,
  };
}
