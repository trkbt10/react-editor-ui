/**
 * @file StrokePropertyRow - Property row for stroke settings
 */

import { memo } from "react";
import type { CSSProperties, ReactNode } from "react";
import { COLOR_TEXT_MUTED, SIZE_FONT_SM, SPACE_SM } from "../../themes/styles";

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const labelStyle: CSSProperties = {
  width: "80px",
  flexShrink: 0,
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

const controlStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

export type StrokePropertyRowProps = {
  label: string;
  children: ReactNode;
};

/**
 * Property row with label and control for stroke settings.
 */
export const StrokePropertyRow = memo(function StrokePropertyRow({
  label,
  children,
}: StrokePropertyRowProps) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={controlStyle}>{children}</div>
    </div>
  );
});
