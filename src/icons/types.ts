/**
 * @file Icon component type definitions and prop interfaces
 */

import type { CSSProperties } from "react";

/**
 * Common props for icon components
 */
export type IconProps = {
  /** Icon size - "sm" | "md" | "lg" or custom pixel number */
  size?: "sm" | "md" | "lg" | number;
  /** Icon color - defaults to currentColor for theme inheritance */
  color?: string;
  /** Additional inline styles */
  style?: CSSProperties;
  /** CSS class name */
  className?: string;
  /** Accessibility label - when provided, icon is marked as img role */
  "aria-label"?: string;
};

/**
 * Props for icons with visual state (e.g., Eye, Lock)
 */
export type StatefulIconProps<T> = IconProps & {
  /** Current state of the icon */
  state: T;
};
