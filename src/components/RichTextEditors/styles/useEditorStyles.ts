/**
 * @file Editor Styles Hook
 *
 * Generates inline style objects for Editor components.
 */

import type { CSSProperties } from "react";
import {
  EDITOR_BG,
  EDITOR_CURSOR_COLOR,
  EDITOR_CURSOR_WIDTH,
  EDITOR_FONT_FAMILY,
  EDITOR_FONT_SIZE,
  EDITOR_LINE_HEIGHT,
  EDITOR_LINE_NUMBER_BG,
  EDITOR_LINE_NUMBER_BORDER,
  EDITOR_LINE_NUMBER_COLOR,
  DEFAULT_LINE_HEIGHT_PX,
  DEFAULT_FONT_SIZE_PX,
  DEFAULT_LINE_NUMBER_WIDTH_PX,
  DEFAULT_PADDING_PX,
} from "./tokens";

// =============================================================================
// Types
// =============================================================================

export type EditorStylesConfig = {
  /** Line height in pixels */
  readonly lineHeight?: number;
  /** Font size in pixels */
  readonly fontSize?: number;
  /** Whether to show line numbers */
  readonly showLineNumbers?: boolean;
  /** Line number gutter width */
  readonly lineNumberWidth?: number;
  /** Padding in pixels */
  readonly padding?: number;
  /** Width of the editor */
  readonly width?: number | string;
  /** Height of the editor */
  readonly height?: number | string;
};

export type EditorStyles = {
  /** Container style */
  readonly container: CSSProperties;
  /** Code area style (scrollable area) */
  readonly codeArea: CSSProperties;
  /** Code display style (holds lines) */
  readonly codeDisplay: CSSProperties;
  /** Hidden textarea style */
  readonly hiddenTextarea: CSSProperties;
  /** Line style */
  readonly line: CSSProperties;
  /** Line number style */
  readonly lineNumber: CSSProperties;
  /** Line content style */
  readonly lineContent: CSSProperties;
  /** Cursor style */
  readonly cursor: CSSProperties;
  /** IME composition overlay style */
  readonly imeComposition: CSSProperties;
  /** Spacer style (for virtual scroll) */
  readonly spacer: (height: number) => CSSProperties;
};

// =============================================================================
// Hook
// =============================================================================

/**
 * Hook to generate editor styles based on configuration.
 *
 * @param config - Style configuration
 * @returns Style objects for editor components
 */
export function useEditorStyles(config: EditorStylesConfig = {}): EditorStyles {
  const {
    lineHeight = DEFAULT_LINE_HEIGHT_PX,
    fontSize = DEFAULT_FONT_SIZE_PX,
    showLineNumbers = true,
    lineNumberWidth = DEFAULT_LINE_NUMBER_WIDTH_PX,
    padding = DEFAULT_PADDING_PX,
    width = "100%",
    height = "100%",
  } = config;

  const container: CSSProperties = {
    position: "relative",
    width,
    height,
    backgroundColor: EDITOR_BG,
    fontFamily: EDITOR_FONT_FAMILY,
    fontSize: EDITOR_FONT_SIZE,
    lineHeight: EDITOR_LINE_HEIGHT,
    overflow: "hidden",
    boxSizing: "border-box",
  };

  const codeArea: CSSProperties = {
    position: "absolute",
    inset: 0,
    overflow: "auto",
    cursor: "text",
  };

  const codeDisplay: CSSProperties = {
    position: "relative",
    minHeight: "100%",
  };

  const hiddenTextarea: CSSProperties = {
    position: "absolute",
    left: showLineNumbers ? lineNumberWidth + padding : padding,
    top: padding,
    width: 1,
    height: lineHeight,
    padding: 0,
    margin: 0,
    border: "none",
    outline: "none",
    resize: "none",
    overflow: "hidden",
    background: "transparent",
    color: "transparent",
    caretColor: "transparent",
    fontFamily: "inherit",
    fontSize: "inherit",
    lineHeight: "inherit",
    whiteSpace: "pre",
    zIndex: 1,
    opacity: 0,
    pointerEvents: "none",
  };

  const line: CSSProperties = {
    display: "flex",
    height: lineHeight,
    alignItems: "center",
  };

  const lineNumber: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    width: lineNumberWidth,
    paddingRight: padding,
    backgroundColor: EDITOR_LINE_NUMBER_BG,
    color: EDITOR_LINE_NUMBER_COLOR,
    fontSize: fontSize,
    lineHeight: `${lineHeight}px`,
    userSelect: "none",
    flexShrink: 0,
    borderRight: `1px solid ${EDITOR_LINE_NUMBER_BORDER}`,
    boxSizing: "border-box",
  };

  const lineContent: CSSProperties = {
    position: "relative",
    flex: 1,
    paddingLeft: padding,
    whiteSpace: "pre",
    minHeight: lineHeight,
  };

  const cursor: CSSProperties = {
    position: "absolute",
    width: EDITOR_CURSOR_WIDTH,
    height: lineHeight,
    backgroundColor: EDITOR_CURSOR_COLOR,
    pointerEvents: "none",
  };

  const imeComposition: CSSProperties = {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderBottom: `2px solid ${EDITOR_CURSOR_COLOR}`,
    pointerEvents: "none",
  };

  const spacer = (height: number): CSSProperties => ({
    height,
    width: "100%",
    flexShrink: 0,
  });

  return {
    container,
    codeArea,
    codeDisplay,
    hiddenTextarea,
    line,
    lineNumber,
    lineContent,
    cursor,
    imeComposition,
    spacer,
  };
}

// =============================================================================
// Cursor Animation Keyframes
// =============================================================================

/**
 * CSS keyframes for cursor blinking animation.
 * Should be injected into the document once.
 */
export const CURSOR_BLINK_KEYFRAMES = `
@keyframes rei-editor-cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
`;

/**
 * Inject cursor blink animation into document.
 * Call this once when editor mounts.
 */
export function injectCursorAnimation(): void {
  if (typeof document === "undefined") {
    return;
  }

  const styleId = "rei-editor-cursor-animation";
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = CURSOR_BLINK_KEYFRAMES;
  document.head.appendChild(style);
}
