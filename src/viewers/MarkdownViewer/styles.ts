/**
 * @file Default block styles for MarkdownViewer
 */

import type { CSSProperties } from "react";
import {
  COLOR_SURFACE,
  COLOR_TEXT,
  COLOR_BORDER,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
  RADIUS_SM,
} from "../../themes/styles";

export const textBlockStyle: CSSProperties = {
  margin: `${SPACE_SM} 0`,
};

export const codeBlockStyle: CSSProperties = {
  fontFamily: "monospace",
  fontSize: "12px",
  backgroundColor: COLOR_SURFACE,
  color: COLOR_TEXT,
  padding: `${SPACE_MD} ${SPACE_LG}`,
  borderRadius: RADIUS_SM,
  whiteSpace: "pre",
  overflow: "auto",
  display: "block",
  margin: `${SPACE_SM} 0`,
};

export const headerBlockStyle: CSSProperties = {
  fontWeight: "bold",
  fontSize: "1.2em",
  margin: `${SPACE_MD} 0 ${SPACE_SM}`,
};

export const listBlockStyle: CSSProperties = {
  margin: `${SPACE_SM} 0`,
  paddingLeft: "20px",
};

export const quoteBlockStyle: CSSProperties = {
  borderLeft: `3px solid ${COLOR_BORDER}`,
  paddingLeft: SPACE_LG,
  margin: `${SPACE_SM} 0`,
  fontStyle: "italic",
  opacity: 0.85,
};

export const tableStyle: CSSProperties = {
  borderCollapse: "collapse" as const,
  width: "100%",
  fontSize: "13px",
  margin: `${SPACE_SM} 0`,
};

export const thStyle: CSSProperties = {
  border: `1px solid ${COLOR_BORDER}`,
  padding: `${SPACE_SM} ${SPACE_MD}`,
  fontWeight: "bold",
  backgroundColor: COLOR_SURFACE,
  color: COLOR_TEXT,
};

export const tdStyle: CSSProperties = {
  border: `1px solid ${COLOR_BORDER}`,
  padding: `${SPACE_SM} ${SPACE_MD}`,
  color: COLOR_TEXT,
};

export const horizontalRuleStyle: CSSProperties = {
  borderTop: `1px solid ${COLOR_BORDER}`,
  margin: `${SPACE_MD} 0`,
};
