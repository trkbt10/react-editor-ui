/**
 * @file useFloatingToolbarPosition hook
 *
 * Calculates the position of the FloatingToolbar relative to an anchor rectangle.
 * Handles viewport clamping to ensure the toolbar stays visible.
 */

import { useMemo } from "react";
import type { FloatingToolbarAnchor, FloatingToolbarPlacement } from "./types";

// =============================================================================
// Constants
// =============================================================================

/** Gap between the toolbar and the anchor */
const TOOLBAR_OFFSET = 8;

/** Minimum padding from viewport edges */
const VIEWPORT_PADDING = 8;

// =============================================================================
// Types
// =============================================================================

/**
 * Computed position for the FloatingToolbar.
 */
export type FloatingToolbarPosition = {
  /** X coordinate (left) */
  readonly x: number;
  /** Y coordinate (top) */
  readonly y: number;
  /** Actual placement after viewport adjustment */
  readonly actualPlacement: FloatingToolbarPlacement;
};

/**
 * Options for position calculation.
 */
export type UseFloatingToolbarPositionOptions = {
  /** Anchor rectangle */
  readonly anchor: FloatingToolbarAnchor;
  /** Preferred placement */
  readonly placement: FloatingToolbarPlacement;
  /** Toolbar width (estimated or measured) */
  readonly toolbarWidth: number;
  /** Toolbar height (estimated or measured) */
  readonly toolbarHeight: number;
};

// =============================================================================
// Position Calculation
// =============================================================================

/**
 * Calculate Y position based on placement.
 */
function calculateYPosition(
  anchor: FloatingToolbarAnchor,
  placement: FloatingToolbarPlacement,
  toolbarHeight: number,
): number {
  if (placement === "top") {
    return anchor.y - toolbarHeight - TOOLBAR_OFFSET;
  }
  return anchor.y + anchor.height + TOOLBAR_OFFSET;
}

/**
 * Calculate raw position without viewport adjustment.
 */
function calculateRawPosition(
  anchor: FloatingToolbarAnchor,
  placement: FloatingToolbarPlacement,
  toolbarWidth: number,
  toolbarHeight: number,
): { x: number; y: number } {
  const x = anchor.x + anchor.width / 2 - toolbarWidth / 2;
  const y = calculateYPosition(anchor, placement, toolbarHeight);
  return { x, y };
}

/**
 * Check if the toolbar would overflow the viewport at the given position.
 */
function wouldOverflowViewport(
  y: number,
  toolbarHeight: number,
  placement: FloatingToolbarPlacement,
): boolean {
  if (placement === "top") {
    return y < VIEWPORT_PADDING;
  }
  return y + toolbarHeight > window.innerHeight - VIEWPORT_PADDING;
}

/**
 * Clamp X position to viewport bounds.
 */
function clampX(x: number, toolbarWidth: number): number {
  const minX = VIEWPORT_PADDING;
  const maxX = window.innerWidth - toolbarWidth - VIEWPORT_PADDING;
  return Math.max(minX, Math.min(x, maxX));
}

/**
 * Get opposite placement.
 */
function getOppositePlacement(placement: FloatingToolbarPlacement): FloatingToolbarPlacement {
  return placement === "top" ? "bottom" : "top";
}

/**
 * Calculate position with potential placement flip.
 */
function calculatePositionWithFlip(
  anchor: FloatingToolbarAnchor,
  placement: FloatingToolbarPlacement,
  toolbarWidth: number,
  toolbarHeight: number,
): { y: number; actualPlacement: FloatingToolbarPlacement } {
  const initialPos = calculateRawPosition(anchor, placement, toolbarWidth, toolbarHeight);

  // Check if we need to flip
  if (!wouldOverflowViewport(initialPos.y, toolbarHeight, placement)) {
    return { y: initialPos.y, actualPlacement: placement };
  }

  const oppositePlacement = getOppositePlacement(placement);
  const oppositePos = calculateRawPosition(anchor, oppositePlacement, toolbarWidth, toolbarHeight);

  // Only flip if the opposite placement doesn't also overflow
  if (!wouldOverflowViewport(oppositePos.y, toolbarHeight, oppositePlacement)) {
    return { y: oppositePos.y, actualPlacement: oppositePlacement };
  }

  // Keep original placement if both overflow
  return { y: initialPos.y, actualPlacement: placement };
}

/**
 * Calculate position for the FloatingToolbar.
 */
export function calculateFloatingToolbarPosition(
  options: UseFloatingToolbarPositionOptions,
): FloatingToolbarPosition {
  const { anchor, placement, toolbarWidth, toolbarHeight } = options;

  const initialPos = calculateRawPosition(anchor, placement, toolbarWidth, toolbarHeight);
  const { y, actualPlacement } = calculatePositionWithFlip(anchor, placement, toolbarWidth, toolbarHeight);
  const x = clampX(initialPos.x, toolbarWidth);

  return { x, y, actualPlacement };
}

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook for calculating FloatingToolbar position.
 *
 * @param options - Position calculation options
 * @returns Computed position with actual placement
 */
export function useFloatingToolbarPosition(
  options: UseFloatingToolbarPositionOptions,
): FloatingToolbarPosition {
  const { anchor, placement, toolbarWidth, toolbarHeight } = options;

  return useMemo(
    () => calculateFloatingToolbarPosition({
      anchor,
      placement,
      toolbarWidth,
      toolbarHeight,
    }),
    [anchor.x, anchor.y, anchor.width, anchor.height, placement, toolbarWidth, toolbarHeight],
  );
}
