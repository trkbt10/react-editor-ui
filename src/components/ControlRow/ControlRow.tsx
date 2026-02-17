/**
 * @file ControlRow component - Horizontal row layout for form controls
 *
 * @description
 * Arranges multiple controls in a flex row with equal widths.
 * Optionally includes an action button or spacer at the end for alignment.
 * Use this for consistent control layouts across panels.
 *
 * @example
 * ```tsx
 * import { ControlRow } from "react-editor-ui/ControlRow";
 * import { Input } from "react-editor-ui/Input";
 * import { IconButton } from "react-editor-ui/IconButton";
 *
 * // Without label
 * <ControlRow action={<IconButton icon={<SettingsIcon />} aria-label="Settings" size="sm" />}>
 *   <Input value="100" prefix="X" />
 *   <Input value="200" prefix="Y" />
 * </ControlRow>
 *
 * // With inline label
 * <ControlRow label="Scale:" action={<IconButton />}>
 *   <Input value="100" suffix="%" />
 *   <Input value="100" suffix="%" />
 * </ControlRow>
 * ```
 */

import { memo, useMemo, Children, isValidElement } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
} from "../../themes/styles";

export type ControlRowProps = {
  /** Control elements to render with equal flex widths */
  children: ReactNode;
  /** Inline label displayed at the start of the row */
  label?: string;
  /** Label width (default: 60px) */
  labelWidth?: string | number;
  /** Action element (typically IconButton) at the end of the row */
  action?: ReactNode;
  /** Add spacer at the end when no action is provided (for alignment with other rows) */
  spacer?: boolean;
  /** Spacer/action size - should match IconButton size for alignment */
  actionSize?: "sm" | "md";
  /** Gap between items */
  gap?: "sm" | "md";
  /** Custom className */
  className?: string;
};

const gapMap = {
  sm: SPACE_SM,
  md: SPACE_MD,
};

const sizeMap = {
  sm: SIZE_HEIGHT_SM,
  md: SIZE_HEIGHT_MD,
};

export const ControlRow = memo(function ControlRow({
  children,
  label,
  labelWidth = 60,
  action,
  spacer = false,
  actionSize = "sm",
  gap = "md",
  className,
}: ControlRowProps) {
  const rowStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: gapMap[gap],
    }),
    [gap],
  );

  const labelStyle = useMemo<CSSProperties>(
    () => ({
      width: typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth,
      flexShrink: 0,
      color: COLOR_TEXT_MUTED,
      fontSize: SIZE_FONT_SM,
    }),
    [labelWidth],
  );

  const itemStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      minWidth: 0,
    }),
    [],
  );

  const spacerStyle = useMemo<CSSProperties>(
    () => ({
      width: sizeMap[actionSize],
      flexShrink: 0,
    }),
    [actionSize],
  );

  const items = Children.toArray(children).filter(isValidElement);

  return (
    <div style={rowStyle} className={className}>
      {label && <span style={labelStyle}>{label}</span>}
      {items.map((child, index) => (
        <div key={index} style={itemStyle}>
          {child}
        </div>
      ))}
      {action}
      {!action && spacer && <div style={spacerStyle} />}
    </div>
  );
});
