/**
 * @file Text module exports
 */

// Types from text layer
export type {
  StyleToken,
  TextEditorProps,
  TextSelectionEvent,
  TextEditorHandle,
  SelectionAnchorRect,
  CommandParams,
} from "./types";

// Note: Core types should be imported directly from ../core/types and ../core/styledDocument

// Components
export { TextEditor } from "./TextEditor";
export { BlockTextEditor } from "./BlockTextEditor";
export type { BlockTextEditorProps } from "./BlockTextEditor";

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

// Commands
export {
  defaultCommands,
  defaultCommandsMap,
  getCommand,
  executeCommand,
  getActiveTagsAtRange,
  executeBlockCommand,
  // Block-level commands (Markdown-style)
  executeBlockLevelCommand,
  setBlockType,
  toggleBulletList,
  toggleNumberedList,
  toggleBlockquote,
  toggleHeading,
} from "./commands";
export type { TextEditorCommand, CommandParams as CommandParamsFromCommands } from "./commands";

// Default Operations for SelectionToolbar
export {
  createInlineOperations,
  defaultInlineOperations,
  allOperationDefinitions,
  inlineOperationDefinitions,
  blockOperationDefinitions,
  operationDefinitionsMap,
  DEFAULT_ENABLED_OPERATIONS,
  getEnabledOperations,
  createConfiguredOperations,
  hasColorOperation,
} from "./defaultOperations";
export type { OperationType, OperationDefinition } from "./defaultOperations";

// Integration Components
export { TextEditorWithToolbar } from "./TextEditorWithToolbar";
export type { TextEditorWithToolbarProps } from "./TextEditorWithToolbar";

export { ColorOperationButton } from "./ColorOperationButton";
export type { ColorOperationButtonProps } from "./ColorOperationButton";

// Integration Hooks
export { useTextSelectionToolbar } from "./useTextSelectionToolbar";
export type {
  UseTextSelectionToolbarOptions,
  UseTextSelectionToolbarReturn,
} from "./useTextSelectionToolbar";
