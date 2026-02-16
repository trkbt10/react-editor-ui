/**
 * @file Text module exports
 */

// Types from text layer
export type { StyleToken, TextEditorProps } from "./types";

// Re-export core types for convenience
export type {
  CompositionState,
  CursorPosition,
  CursorState,
  EditorConfig,
  HighlightRange,
  SelectionRange,
  TextStyle,
  TextStyleSegment,
} from "../core/types";

// Re-export styledDocument types
export type { StyledDocument } from "../core/styledDocument";

// Components
export { TextEditor } from "./TextEditor";

// Hooks
export { useTextStyles } from "./useTextStyles";
export type { UseTextStylesResult } from "./useTextStyles";

export { useTextTokenCache } from "./useTextTokenCache";
export type { TextTokenizer } from "./useTextTokenCache";

export { useStyledMeasurement, styledCoordinatesToPosition } from "./useStyledMeasurement";
export type { StyledMeasurement, UseStyledMeasurementOptions, StyledCoordinatesToPositionOptions } from "./useStyledMeasurement";
