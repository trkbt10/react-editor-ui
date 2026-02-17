/**
 * @file SelectionToolbar types
 *
 * Type definitions for the SelectionToolbar component.
 * This component is Editor-agnostic and can be used with any selection-based UI.
 */

import type { ReactNode } from "react";

// =============================================================================
// Anchor Types
// =============================================================================

/**
 * Anchor rectangle for positioning the SelectionToolbar.
 * Represents the bounding box of the selected content.
 */
export type SelectionToolbarAnchor = {
  /** X coordinate of the anchor (viewport-relative) */
  readonly x: number;
  /** Y coordinate of the anchor (viewport-relative) */
  readonly y: number;
  /** Width of the anchor rectangle */
  readonly width: number;
  /** Height of the anchor rectangle */
  readonly height: number;
};

// =============================================================================
// Operation Types
// =============================================================================

/**
 * A single operation that can be performed from the SelectionToolbar.
 * Operations are UI-only definitions; the actual logic is handled by the consumer.
 */
export type SelectionToolbarOperation = {
  /** Unique identifier for the operation */
  readonly id: string;
  /** Display label for the operation */
  readonly label: string;
  /** Icon to display for the operation */
  readonly icon: ReactNode;
  /** Optional keyboard shortcut hint */
  readonly shortcut?: string;
  /** Whether the operation is disabled */
  readonly disabled?: boolean;
  /** Whether the operation is currently active (e.g., bold is applied) */
  readonly active?: boolean;
};

// =============================================================================
// Component Props
// =============================================================================

/**
 * Placement of the SelectionToolbar relative to the anchor.
 */
export type SelectionToolbarPlacement = "top" | "bottom";

/**
 * Props for the SelectionToolbar component.
 */
export type SelectionToolbarProps = {
  /** Anchor rectangle defining where to position the toolbar */
  readonly anchor: SelectionToolbarAnchor;
  /** Operations to display in the toolbar */
  readonly operations: readonly SelectionToolbarOperation[];
  /** Callback when an operation is selected */
  readonly onOperationSelect: (operationId: string) => void;
  /** Preferred placement relative to anchor (default: "top") */
  readonly placement?: SelectionToolbarPlacement;
  /** Additional CSS class name */
  readonly className?: string;
};
