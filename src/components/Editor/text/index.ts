/**
 * @file Text module exports
 */

// Types from text layer
export type { StyleToken, TextEditorProps } from "./types";

// Note: Core types should be imported directly from ../core/types and ../core/styledDocument

// Components
export { TextEditor } from "./TextEditor";

// Hooks
export { useTextStyles } from "./useTextStyles";
export type { UseTextStylesResult } from "./useTextStyles";

export { useTextTokenCache } from "./useTextTokenCache";
export type { TextTokenizer } from "./useTextTokenCache";

export { useStyledMeasurement, styledCoordinatesToPosition } from "./useStyledMeasurement";
export type { StyledMeasurement, UseStyledMeasurementOptions, StyledCoordinatesToPositionOptions } from "./useStyledMeasurement";
