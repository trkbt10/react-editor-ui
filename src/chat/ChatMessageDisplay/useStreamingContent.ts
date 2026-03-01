/**
 * @file useStreamingContent - Hook for efficiently handling streaming content updates
 *
 * Designed for chat scenarios where text arrives in chunks (e.g., LLM streaming).
 * - Appends text chunks without re-parsing entire content
 * - Supports mixed content (text + images/videos)
 * - Deferred markdown parsing (only when complete)
 * - Efficient text extraction via memoization
 */

import { useState, useCallback, useRef, useMemo } from "react";
import type { ContentPart, TextContentPart } from "./types";

// =============================================================================
// Types
// =============================================================================

export type UseStreamingContentOptions = {
  /** Initial content parts */
  initialParts?: ContentPart[];
  /** Debounce interval for text updates (ms). Default: 0 (immediate) */
  debounceMs?: number;
};

export type UseStreamingContentReturn = {
  /** Current content parts */
  parts: ContentPart[];
  /** Whether streaming is in progress */
  isStreaming: boolean;
  /** Extracted text content (memoized, joined from all text parts) */
  textContent: string;
  /** Append a text chunk to the current/last text part */
  appendText: (chunk: string) => void;
  /** Append a complete content part (image, video, etc.) */
  appendPart: (part: ContentPart) => void;
  /** Replace all parts at once */
  setParts: (parts: ContentPart[]) => void;
  /** Mark streaming as complete */
  complete: () => void;
  /** Reset to initial state */
  reset: () => void;
};

// =============================================================================
// Internal State
// =============================================================================

type StreamState = {
  /** Accumulated text for current text part */
  pendingText: string;
  /** Completed parts */
  completedParts: ContentPart[];
  /** Debounce timer */
  debounceTimer: ReturnType<typeof setTimeout> | null;
};

// =============================================================================
// Helpers
// =============================================================================

/** Extract all text from content parts */
function extractTextContent(parts: ContentPart[]): string {
  const textParts: string[] = [];

  for (const part of parts) {
    if (part.type === "text") {
      textParts.push(part.text);
    }
  }

  return textParts.join("\n");
}

/** Create a text content part */
function createTextPart(text: string): TextContentPart {
  return { type: "text", text };
}

/** Merge pending text into parts array */
function mergeWithPendingText(
  completedParts: ContentPart[],
  pendingText: string,
): ContentPart[] {
  if (!pendingText) {
    return completedParts;
  }

  // Check if last part is text - if so, we need to append to it
  const lastPart = completedParts[completedParts.length - 1];
  if (lastPart?.type === "text") {
    // Clone array and update last text part
    const result = [...completedParts];
    result[result.length - 1] = createTextPart(lastPart.text + pendingText);
    return result;
  }

  // Otherwise, add new text part
  return [...completedParts, createTextPart(pendingText)];
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for efficiently handling streaming content updates.
 *
 * @example
 * ```tsx
 * const { parts, textContent, appendText, complete, isStreaming } = useStreamingContent();
 *
 * // On receiving SSE chunks from LLM
 * useEffect(() => {
 *   eventSource.onmessage = (e) => {
 *     if (e.data === "[DONE]") {
 *       complete();
 *     } else {
 *       appendText(JSON.parse(e.data).content);
 *     }
 *   };
 * }, [appendText, complete]);
 *
 * // Render
 * return isStreaming
 *   ? <PlainText>{textContent}</PlainText>
 *   : <MarkdownViewer value={textContent} />;
 * ```
 */
export function useStreamingContent(
  options: UseStreamingContentOptions = {},
): UseStreamingContentReturn {
  const { initialParts = [], debounceMs = 0 } = options;

  const [parts, setParts] = useState<ContentPart[]>(initialParts);
  const [isStreaming, setIsStreaming] = useState(false);
  const stateRef = useRef<StreamState>({
    pendingText: "",
    completedParts: initialParts,
    debounceTimer: null,
  });

  // Memoized text content extraction
  const textContent = useMemo(() => extractTextContent(parts), [parts]);

  // Flush pending text to parts
  const flushPendingText = useCallback(() => {
    const state = stateRef.current;
    if (!state.pendingText) {
      return;
    }

    const newParts = mergeWithPendingText(state.completedParts, state.pendingText);
    state.completedParts = newParts;
    state.pendingText = "";
    setParts(newParts);
  }, []);

  // Append text chunk
  const appendText = useCallback(
    (chunk: string) => {
      if (!chunk) {
        return;
      }

      const state = stateRef.current;

      // Start streaming if not already
      if (!isStreaming) {
        setIsStreaming(true);
      }

      // Accumulate text
      state.pendingText += chunk;

      // Clear existing timer
      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
      }

      // Flush immediately or with debounce
      if (debounceMs === 0) {
        flushPendingText();
      } else {
        state.debounceTimer = setTimeout(flushPendingText, debounceMs);
      }
    },
    [isStreaming, debounceMs, flushPendingText],
  );

  // Append a complete content part
  const appendPart = useCallback(
    (part: ContentPart) => {
      const state = stateRef.current;

      // Flush any pending text first
      flushPendingText();

      // Add the new part
      state.completedParts = [...state.completedParts, part];
      setParts(state.completedParts);

      if (!isStreaming) {
        setIsStreaming(true);
      }
    },
    [isStreaming, flushPendingText],
  );

  // Set all parts at once (for non-streaming updates)
  const setPartsDirectly = useCallback((newParts: ContentPart[]) => {
    const state = stateRef.current;
    state.completedParts = newParts;
    state.pendingText = "";
    setParts(newParts);
  }, []);

  // Complete streaming
  const complete = useCallback(() => {
    const state = stateRef.current;

    // Clear any pending timer
    if (state.debounceTimer) {
      clearTimeout(state.debounceTimer);
      state.debounceTimer = null;
    }

    // Flush any remaining text
    flushPendingText();

    setIsStreaming(false);
  }, [flushPendingText]);

  // Reset to initial state
  const reset = useCallback(() => {
    const state = stateRef.current;

    if (state.debounceTimer) {
      clearTimeout(state.debounceTimer);
    }

    state.pendingText = "";
    state.completedParts = initialParts;
    state.debounceTimer = null;

    setParts(initialParts);
    setIsStreaming(false);
  }, [initialParts]);

  return {
    parts,
    isStreaming,
    textContent,
    appendText,
    appendPart,
    setParts: setPartsDirectly,
    complete,
    reset,
  };
}
