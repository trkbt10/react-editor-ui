/**
 * @file Shared types for section components
 */

import type { ReactNode } from "react";

/**
 * Common props shared across all section components.
 */
export type BaseSectionProps = {
  /** Additional action element (e.g., toggle button) */
  action?: ReactNode;
  /** Custom className */
  className?: string;
};
