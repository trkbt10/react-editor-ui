/**
 * @file ControlGroup component - Vertical group with label and controls
 *
 * @description
 * Groups controls vertically with an optional label above.
 * Use this for organizing related controls in panels.
 *
 * @example
 * ```tsx
 * import { ControlGroup, ControlRow } from "react-editor-ui/ControlRow";
 * import { Input } from "react-editor-ui/Input";
 *
 * <ControlGroup label="Position">
 *   <ControlRow>
 *     <Input value="100" prefix="X" />
 *     <Input value="200" prefix="Y" />
 *   </ControlRow>
 * </ControlGroup>
 * ```
 */

import { memo, useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
} from "../../themes/styles";

export type ControlGroupProps = {
  /** Label displayed above the controls */
  label?: string;
  /** Content (typically ControlRow or other controls) */
  children: ReactNode;
  /** Gap between label and content */
  gap?: "sm" | "md";
  /** Custom className */
  className?: string;
};

const gapMap = {
  sm: SPACE_SM,
  md: SPACE_MD,
};

export const ControlGroup = memo(function ControlGroup({
  label,
  children,
  gap = "sm",
  className,
}: ControlGroupProps) {
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: gapMap[gap],
    }),
    [gap],
  );

  const labelStyle = useMemo<CSSProperties>(
    () => ({
      color: COLOR_TEXT_MUTED,
      fontSize: SIZE_FONT_SM,
    }),
    [],
  );

  return (
    <div style={containerStyle} className={className}>
      {label && <div style={labelStyle}>{label}</div>}
      {children}
    </div>
  );
});
