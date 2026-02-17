/**
 * @file StrokeStyleSelect - Stroke style selector (solid/dashed/dotted)
 */

import { memo } from "react";
import { Select, type SelectOption } from "../Select/Select";

export type StrokeStyle = "solid" | "dashed" | "dotted";

export type StrokeStyleSelectProps = {
  /** Current stroke style */
  value: StrokeStyle;
  /** Called when stroke style changes */
  onChange: (value: StrokeStyle) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Aria label */
  "aria-label"?: string;
};

const styleOptions: SelectOption<StrokeStyle>[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

/**
 * Stroke style selector.
 */
export const StrokeStyleSelect = memo(function StrokeStyleSelect({
  value,
  onChange,
  size = "md",
  "aria-label": ariaLabel = "Stroke style",
}: StrokeStyleSelectProps) {
  return (
    <Select
      options={styleOptions}
      value={value}
      onChange={onChange}
      size={size}
      aria-label={ariaLabel}
    />
  );
});
