/**
 * @file useAutoResize hook - Auto-resize textarea based on content
 */

import { useLayoutEffect, type RefObject } from "react";

export type UseAutoResizeOptions = {
  /** Minimum height in pixels */
  minHeight?: number;
  /** Maximum height in pixels */
  maxHeight?: number;
};

const DEFAULT_MIN_HEIGHT = 24;
const DEFAULT_MAX_HEIGHT = 200;

/**
 * Auto-resizes a textarea element based on its content.
 * The textarea height will be adjusted between minHeight and maxHeight.
 *
 * @param textareaRef - Ref to the textarea element
 * @param value - Current textarea value (used as dependency)
 * @param options - Configuration options
 */
export function useAutoResize(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  options: UseAutoResizeOptions = {},
): void {
  const {
    minHeight = DEFAULT_MIN_HEIGHT,
    maxHeight = DEFAULT_MAX_HEIGHT,
  } = options;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    // Reset height to get accurate scrollHeight
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [textareaRef, value, minHeight, maxHeight]);
}
