/**
 * @file Text module exports
 */

// Types
export type {
  CompositionState,
  CursorPosition,
  CursorState,
  EditorConfig,
  HighlightRange,
  SelectionRange,
  StyledDocument,
  StyleToken,
  TextEditorProps,
  TextStyle,
  TextStyleSegment,
} from "./types";

// Components
export { TextEditor } from "./TextEditor";

// Hooks
export { useTextStyles } from "./useTextStyles";
export type { UseTextStylesResult } from "./useTextStyles";

export { useTextTokenCache } from "./useTextTokenCache";
export type { TextTokenizer } from "./useTextTokenCache";

export { useStyledMeasurement, styledCoordinatesToPosition } from "./useStyledMeasurement";
export type { StyledMeasurement, UseStyledMeasurementOptions, StyledCoordinatesToPositionOptions } from "./useStyledMeasurement";
