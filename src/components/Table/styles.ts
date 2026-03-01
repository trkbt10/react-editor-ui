/**
 * @file Table component static styles
 */

import type { CSSProperties } from "react";
import {
  COLOR_SURFACE,
  COLOR_SURFACE_RAISED,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_DROP_TARGET,
  COLOR_PRIMARY,
  SPACE_XS,
  SPACE_SM,
  SIZE_FONT_SM,
  SIZE_HEIGHT_MD,
  FONT_WEIGHT_SEMIBOLD,
  Z_STICKY,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";

// ============================================================================
// Header styles
// ============================================================================

export const TABLE_HEADER_STYLE: CSSProperties = {
  display: "flex",
  backgroundColor: COLOR_SURFACE_RAISED,
  borderBottom: `1px solid ${COLOR_BORDER}`,
  minHeight: SIZE_HEIGHT_MD,
};

export const TABLE_HEADER_STICKY_STYLE: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: Z_STICKY,
};

export const TABLE_HEADER_CELL_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: `${SPACE_XS} ${SPACE_SM}`,
  fontWeight: FONT_WEIGHT_SEMIBOLD,
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT,
  userSelect: "none",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  borderRight: `1px solid ${COLOR_BORDER}`,
  minWidth: 0,
  flexShrink: 0,
  cursor: "default",
  transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
};

export const TABLE_HEADER_CELL_SORTABLE_STYLE: CSSProperties = {
  cursor: "pointer",
};

export const TABLE_HEADER_CELL_DRAGGING_STYLE: CSSProperties = {
  opacity: 0.5,
};

export const TABLE_HEADER_CELL_DRAG_OVER_STYLE: CSSProperties = {
  backgroundColor: COLOR_DROP_TARGET,
};

// ============================================================================
// Row styles
// ============================================================================

export const TABLE_ROW_STYLE: CSSProperties = {
  display: "flex",
  minHeight: SIZE_HEIGHT_MD,
  backgroundColor: COLOR_SURFACE,
  borderBottom: `1px solid ${COLOR_BORDER}`,
  transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  cursor: "default",
};

export const TABLE_ROW_HOVER_BG = COLOR_HOVER;
export const TABLE_ROW_SELECTED_BG = COLOR_SELECTED;

// ============================================================================
// Cell styles
// ============================================================================

export const TABLE_CELL_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: `${SPACE_XS} ${SPACE_SM}`,
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  borderRight: `1px solid ${COLOR_BORDER}`,
  minWidth: 0,
  flexShrink: 0,
};

// ============================================================================
// Sort icon styles
// ============================================================================

export const SORT_ICON_STYLE: CSSProperties = {
  marginLeft: SPACE_XS,
  flexShrink: 0,
  color: COLOR_TEXT_MUTED,
};

export const SORT_ICON_ACTIVE_STYLE: CSSProperties = {
  color: COLOR_PRIMARY,
};

// ============================================================================
// Drag handle styles
// ============================================================================

export const DRAG_HANDLE_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginRight: SPACE_XS,
  cursor: "grab",
  color: COLOR_TEXT_MUTED,
  opacity: 0,
  transition: `opacity ${DURATION_FAST} ${EASING_DEFAULT}`,
};

export const DRAG_HANDLE_VISIBLE_STYLE: CSSProperties = {
  opacity: 1,
};
