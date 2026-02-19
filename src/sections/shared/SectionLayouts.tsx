/**
 * @file Section layout primitives
 *
 * @description
 * Reusable layout components for building consistent section UIs.
 * These handle common flex patterns used across multiple sections.
 */

import { memo, type CSSProperties, type ReactNode } from "react";
import { SPACE_SM, COLOR_TEXT_MUTED } from "../../themes/styles";

// ============================================================================
// FlexWrap - Horizontal layout with wrap
// ============================================================================

const flexWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: SPACE_SM,
};

export type FlexWrapProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal flex container that wraps items to next line when needed.
 * Use for groups of controls that should sit side-by-side when space allows.
 */
export const FlexWrap = memo(function FlexWrap({
  children,
  className,
}: FlexWrapProps) {
  return (
    <div style={flexWrapStyle} className={className}>
      {children}
    </div>
  );
});

// ============================================================================
// FlexGroup - Grouped items in a row (no wrap)
// ============================================================================

const flexGroupStyle: CSSProperties = {
  display: "flex",
  gap: SPACE_SM,
};

export type FlexGroupProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal flex container for grouping related controls.
 * Use inside FlexWrap for logical grouping (e.g., 3 horizontal + 3 vertical buttons).
 */
export const FlexGroup = memo(function FlexGroup({
  children,
  className,
}: FlexGroupProps) {
  return (
    <div style={flexGroupStyle} className={className}>
      {children}
    </div>
  );
});

// ============================================================================
// FlexColumn - Vertical stack
// ============================================================================

const flexColumnStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

export type FlexColumnProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Vertical flex container for stacking items.
 */
export const FlexColumn = memo(function FlexColumn({
  children,
  className,
}: FlexColumnProps) {
  return (
    <div style={flexColumnStyle} className={className}>
      {children}
    </div>
  );
});

// ============================================================================
// IconRow - Icon + content in a row
// ============================================================================

const iconRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const iconWrapperStyle: CSSProperties = {
  width: 16,
  height: 16,
  color: COLOR_TEXT_MUTED,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const iconRowContentStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

export type IconRowProps = {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Row with an icon and flexible content (typically an input).
 * Icon is fixed width, content fills remaining space.
 */
export const IconRow = memo(function IconRow({
  icon,
  children,
  className,
}: IconRowProps) {
  return (
    <div style={iconRowStyle} className={className}>
      <span style={iconWrapperStyle}>{icon}</span>
      <div style={iconRowContentStyle}>{children}</div>
    </div>
  );
});

// ============================================================================
// FlexRow - Centered row (like FlexGroup but with vertical centering)
// ============================================================================

const flexRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

export type FlexRowProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Horizontal flex container with vertically centered items.
 * Use for rows with mixed-height elements that need alignment.
 */
export const FlexRow = memo(function FlexRow({
  children,
  className,
}: FlexRowProps) {
  return (
    <div style={flexRowStyle} className={className}>
      {children}
    </div>
  );
});

// ============================================================================
// LabeledField - Label above content
// ============================================================================

const labeledFieldLabelStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
  fontSize: "11px",
  marginBottom: "2px",
  display: "block",
};

export type LabeledFieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/**
 * Field with a label above the content.
 * Use for inputs that need a visible label.
 */
export const LabeledField = memo(function LabeledField({
  label,
  children,
  className,
}: LabeledFieldProps) {
  return (
    <div className={className}>
      <span style={labeledFieldLabelStyle}>{label}</span>
      {children}
    </div>
  );
});

// ============================================================================
// LabelRow - Label + content in a row
// ============================================================================

const labelRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const labelRowLabelStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
  fontSize: "11px",
  flexShrink: 0,
};

export type LabelRowProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

/**
 * Row with a label and content side by side.
 * Use for inline labeled controls (e.g., "Align To: [select]").
 */
export const LabelRow = memo(function LabelRow({
  label,
  children,
  className,
}: LabelRowProps) {
  return (
    <div style={labelRowStyle} className={className}>
      <span style={labelRowLabelStyle}>{label}</span>
      {children}
    </div>
  );
});
