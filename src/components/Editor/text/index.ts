/**
 * @file Text module exports
 */

// Types from text layer
export type { StyleToken, TextEditorProps } from "./types";

// Note: Core types should be imported directly from ../core/types and ../core/styledDocument

// Components
export { TextEditor } from "./TextEditor";

// Pure Functions - Text Diff
export {
  findCommonPrefixLength,
  findSuffixBoundaries,
  computeTextDiff,
} from "./textDiff";
export type { TextDiffResult } from "./textDiff";

// Pure Functions - Text Styles
export {
  DEFAULT_TOKEN_TYPE,
  DEFAULT_STYLE,
  generateTokenType,
  textStyleToCss,
  buildStyleEntries,
  findOverlappingEntries,
} from "./textStyles";
export type { StyleEntry } from "./textStyles";

// Pure Functions - Styled Measurement
export {
  parseFontSize,
  findStyleAtOffset,
  styledCoordinatesToPosition,
} from "./styledMeasurement";
export type { StyledCoordinatesToPositionOptions } from "./styledMeasurement";

// Hooks
export { useTextStyles } from "./useTextStyles";
export type { UseTextStylesResult } from "./useTextStyles";

export { useTextTokenCache } from "./useTextTokenCache";
export type { TextTokenizer } from "./useTextTokenCache";

export { useStyledMeasurement } from "./useStyledMeasurement";
export type { StyledMeasurement, UseStyledMeasurementOptions } from "./useStyledMeasurement";
