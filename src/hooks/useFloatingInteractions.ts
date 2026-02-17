/**
 * @file useFloatingInteractions hook
 *
 * Handles common interactions for floating elements:
 * - Click outside detection
 * - Escape key to close
 * - Scroll/resize repositioning
 */

import { useEffect, useEffectEvent, type RefObject } from "react";

// =============================================================================
// Types
// =============================================================================

export type UseFloatingInteractionsOptions = {
  /** Whether the floating element is currently open */
  readonly isOpen: boolean;
  /** Callback to close the floating element */
  readonly onClose: () => void;
  /** Reference to the anchor/trigger element */
  readonly anchorRef: RefObject<HTMLElement | null>;
  /** Reference to the floating element */
  readonly floatingRef: RefObject<HTMLElement | null>;
  /** Callback when the floating element needs to be repositioned */
  readonly onReposition?: () => void;
  /** Whether to close on Escape key (default: true) */
  readonly closeOnEscape?: boolean;
  /** Whether to close on click outside (default: true) */
  readonly closeOnClickOutside?: boolean;
  /** Whether to reposition on scroll (default: true) */
  readonly repositionOnScroll?: boolean;
  /** Whether to reposition on resize (default: true) */
  readonly repositionOnResize?: boolean;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for handling common floating element interactions.
 *
 * @example
 * ```tsx
 * useFloatingInteractions({
 *   isOpen,
 *   onClose: () => setIsOpen(false),
 *   anchorRef: buttonRef,
 *   floatingRef: dropdownRef,
 *   onReposition: updatePosition,
 * });
 * ```
 */
export function useFloatingInteractions({
  isOpen,
  onClose,
  anchorRef,
  floatingRef,
  onReposition,
  closeOnEscape = true,
  closeOnClickOutside = true,
  repositionOnScroll = true,
  repositionOnResize = true,
}: UseFloatingInteractionsOptions): void {
  // Use useEffectEvent to avoid stale closures
  const handleClickOutside = useEffectEvent((event: PointerEvent) => {
    if (!closeOnClickOutside) {
      return;
    }

    const target = event.target as Node;

    // Check if click is outside both anchor and floating element
    const isOutsideAnchor = anchorRef.current && !anchorRef.current.contains(target);
    const isOutsideFloating = floatingRef.current && !floatingRef.current.contains(target);

    if (isOutsideAnchor && isOutsideFloating) {
      onClose();
    }
  });

  const handleKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (closeOnEscape && event.key === "Escape") {
      onClose();
    }
  });

  const handleReposition = useEffectEvent(() => {
    onReposition?.();
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // Click outside detection
    document.addEventListener("pointerdown", handleClickOutside);

    // Escape key detection
    document.addEventListener("keydown", handleKeyDown);

    // Scroll repositioning (use capture to catch scroll on any element)
    if (repositionOnScroll && onReposition) {
      window.addEventListener("scroll", handleReposition, true);
    }

    // Resize repositioning
    if (repositionOnResize && onReposition) {
      window.addEventListener("resize", handleReposition);
    }

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      if (repositionOnScroll && onReposition) {
        window.removeEventListener("scroll", handleReposition, true);
      }
      if (repositionOnResize && onReposition) {
        window.removeEventListener("resize", handleReposition);
      }
    };
  }, [isOpen, repositionOnScroll, repositionOnResize, onReposition]);
}
