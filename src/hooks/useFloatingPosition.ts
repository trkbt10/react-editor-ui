/**
 * @file useFloatingPosition hook
 *
 * Calculates the position of a floating element (dropdown, tooltip, popover)
 * relative to an anchor element. Handles viewport clamping and automatic
 * placement flipping when there's not enough space.
 */

import { useMemo } from "react";

// =============================================================================
// Types
// =============================================================================

export type FloatingPlacement = "top" | "bottom" | "left" | "right";

export type FloatingAnchor = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

export type FloatingPositionOptions = {
  /** Anchor element's bounding rectangle */
  readonly anchor: FloatingAnchor | null;
  /** Floating element's size */
  readonly floatingWidth: number;
  readonly floatingHeight: number;
  /** Preferred placement direction */
  readonly placement: FloatingPlacement;
  /** Gap between anchor and floating element (default: 4) */
  readonly offset?: number;
  /** Minimum padding from viewport edges (default: 8) */
  readonly viewportPadding?: number;
  /** Whether to flip to opposite side if there's not enough space (default: true) */
  readonly allowFlip?: boolean;
  /** Whether to include scroll offset for absolute positioning (default: true) */
  readonly includeScrollOffset?: boolean;
};

export type FloatingPositionResult = {
  /** X coordinate (left) */
  readonly x: number;
  /** Y coordinate (top) */
  readonly y: number;
  /** Actual placement after potential flip */
  readonly actualPlacement: FloatingPlacement;
};

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_OFFSET = 4;
const DEFAULT_VIEWPORT_PADDING = 8;

// =============================================================================
// Pure Position Calculation Functions
// =============================================================================

/**
 * Get the opposite placement direction.
 */
function getOppositePlacement(placement: FloatingPlacement): FloatingPlacement {
  switch (placement) {
    case "top":
      return "bottom";
    case "bottom":
      return "top";
    case "left":
      return "right";
    case "right":
      return "left";
  }
}

/**
 * Calculate raw position without viewport adjustment.
 */
function calculateRawPosition(
  anchor: FloatingAnchor,
  placement: FloatingPlacement,
  floatingWidth: number,
  floatingHeight: number,
  offset: number,
): { x: number; y: number } {
  switch (placement) {
    case "top":
      return {
        x: anchor.x + anchor.width / 2 - floatingWidth / 2,
        y: anchor.y - floatingHeight - offset,
      };
    case "bottom":
      return {
        x: anchor.x + anchor.width / 2 - floatingWidth / 2,
        y: anchor.y + anchor.height + offset,
      };
    case "left":
      return {
        x: anchor.x - floatingWidth - offset,
        y: anchor.y + anchor.height / 2 - floatingHeight / 2,
      };
    case "right":
      return {
        x: anchor.x + anchor.width + offset,
        y: anchor.y + anchor.height / 2 - floatingHeight / 2,
      };
  }
}

/**
 * Check if the floating element would overflow the viewport at the given position.
 */
function wouldOverflowViewport(
  x: number,
  y: number,
  floatingWidth: number,
  floatingHeight: number,
  placement: FloatingPlacement,
  viewportPadding: number,
): boolean {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  switch (placement) {
    case "top":
      return y < viewportPadding;
    case "bottom":
      return y + floatingHeight > viewportHeight - viewportPadding;
    case "left":
      return x < viewportPadding;
    case "right":
      return x + floatingWidth > viewportWidth - viewportPadding;
  }
}

/**
 * Clamp X position to viewport bounds.
 */
function clampX(x: number, floatingWidth: number, viewportPadding: number): number {
  const minX = viewportPadding;
  const maxX = window.innerWidth - floatingWidth - viewportPadding;
  return Math.max(minX, Math.min(x, maxX));
}

/**
 * Clamp Y position to viewport bounds.
 */
function clampY(y: number, floatingHeight: number, viewportPadding: number): number {
  const minY = viewportPadding;
  const maxY = window.innerHeight - floatingHeight - viewportPadding;
  return Math.max(minY, Math.min(y, maxY));
}

/**
 * Calculate position with potential placement flip.
 */
function calculatePositionWithFlip(
  anchor: FloatingAnchor,
  placement: FloatingPlacement,
  floatingWidth: number,
  floatingHeight: number,
  offset: number,
  viewportPadding: number,
  allowFlip: boolean,
): { x: number; y: number; actualPlacement: FloatingPlacement } {
  const initialPos = calculateRawPosition(anchor, placement, floatingWidth, floatingHeight, offset);

  // Check if we need to flip
  if (
    allowFlip &&
    wouldOverflowViewport(initialPos.x, initialPos.y, floatingWidth, floatingHeight, placement, viewportPadding)
  ) {
    const oppositePlacement = getOppositePlacement(placement);
    const oppositePos = calculateRawPosition(anchor, oppositePlacement, floatingWidth, floatingHeight, offset);

    // Only flip if the opposite placement doesn't also overflow
    if (
      !wouldOverflowViewport(
        oppositePos.x,
        oppositePos.y,
        floatingWidth,
        floatingHeight,
        oppositePlacement,
        viewportPadding,
      )
    ) {
      return { ...oppositePos, actualPlacement: oppositePlacement };
    }
  }

  return { ...initialPos, actualPlacement: placement };
}

/**
 * Calculate the final position for a floating element.
 */
export function calculateFloatingPosition(options: FloatingPositionOptions): FloatingPositionResult {
  const {
    anchor,
    floatingWidth,
    floatingHeight,
    placement,
    offset = DEFAULT_OFFSET,
    viewportPadding = DEFAULT_VIEWPORT_PADDING,
    allowFlip = true,
    includeScrollOffset = true,
  } = options;

  // Return default position if anchor is not available
  if (!anchor) {
    return { x: 0, y: 0, actualPlacement: placement };
  }

  // Calculate position with potential flip
  const { x: rawX, y: rawY, actualPlacement } = calculatePositionWithFlip(
    anchor,
    placement,
    floatingWidth,
    floatingHeight,
    offset,
    viewportPadding,
    allowFlip,
  );

  // Clamp to viewport bounds
  const clampedX = clampX(rawX, floatingWidth, viewportPadding);
  const clampedY = clampY(rawY, floatingHeight, viewportPadding);

  // Add scroll offset for absolute positioning
  const scrollX = includeScrollOffset ? window.scrollX : 0;
  const scrollY = includeScrollOffset ? window.scrollY : 0;

  return {
    x: clampedX + scrollX,
    y: clampedY + scrollY,
    actualPlacement,
  };
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for calculating floating element position with automatic flipping
 * and viewport clamping.
 *
 * @example
 * ```tsx
 * const anchorRect = anchorRef.current?.getBoundingClientRect();
 * const { x, y, actualPlacement } = useFloatingPosition({
 *   anchor: anchorRect ? {
 *     x: anchorRect.left,
 *     y: anchorRect.top,
 *     width: anchorRect.width,
 *     height: anchorRect.height,
 *   } : null,
 *   floatingWidth: 200,
 *   floatingHeight: 100,
 *   placement: "bottom",
 * });
 * ```
 */
export function useFloatingPosition(options: FloatingPositionOptions): FloatingPositionResult {
  const {
    anchor,
    floatingWidth,
    floatingHeight,
    placement,
    offset = DEFAULT_OFFSET,
    viewportPadding = DEFAULT_VIEWPORT_PADDING,
    allowFlip = true,
    includeScrollOffset = true,
  } = options;

  return useMemo(
    () =>
      calculateFloatingPosition({
        anchor,
        floatingWidth,
        floatingHeight,
        placement,
        offset,
        viewportPadding,
        allowFlip,
        includeScrollOffset,
      }),
    [
      anchor?.x,
      anchor?.y,
      anchor?.width,
      anchor?.height,
      floatingWidth,
      floatingHeight,
      placement,
      offset,
      viewportPadding,
      allowFlip,
      includeScrollOffset,
    ],
  );
}

// =============================================================================
// Utility: Convert DOMRect to FloatingAnchor
// =============================================================================

/**
 * Convert a DOMRect to FloatingAnchor format.
 */
export function rectToAnchor(rect: DOMRect | null): FloatingAnchor | null {
  if (!rect) {
    return null;
  }
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}
