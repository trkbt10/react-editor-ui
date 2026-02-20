/**
 * @file Wrap Module Exports
 *
 * Text wrapping support for RichTextEditors.
 * Provides soft wrap (automatic at container width) and word wrap (break at word boundaries).
 */

// Types
export type {
  WrapMode,
  WrapPoint,
  VisualLine,
  WrapLayoutIndex,
  LogicalPosition,
  VisualPosition,
  MeasureTextFn,
} from "./types";

export { DEFAULT_WRAP_MODE } from "./types";

// Wrap calculation functions
export {
  isWordBoundaryChar,
  isCJKChar,
  isWordBreakPoint,
  findWrapPosition,
  calculateLineWrapPoints,
  getLineSegments,
} from "./wrapCalculation";

export type { CalculateWrapOptions } from "./wrapCalculation";

// WrapLayoutIndex build and query functions
export {
  buildWrapLayoutIndex,
  buildNoWrapLayoutIndex,
  findVisualLineAtY,
  getVisualLine,
  getFirstVisualLineForLogical,
  getVisualLineCountForLogical,
  logicalToVisual,
  visualToLogical,
  globalOffsetToVisual,
  visualToGlobalOffset,
} from "./WrapLayoutIndex";

export type { BuildWrapLayoutIndexOptions } from "./WrapLayoutIndex";

// React hooks
export {
  useWrapLayoutIndex,
  useContainerWidth,
  useWrapLayoutWithContainer,
} from "./useWrapLayoutIndex";

export type { UseWrapLayoutIndexOptions } from "./useWrapLayoutIndex";

// Visual line navigation
export {
  moveUpVisualLine,
  moveDownVisualLine,
  moveToVisualLineStart,
  moveToVisualLineEnd,
  moveToLogicalLineStart,
  moveToLogicalLineEnd,
  getVisualColumn,
  logicalToOffset,
  offsetToLogical,
} from "./visualLineNavigation";

export type { NavigationResult } from "./visualLineNavigation";
