/**
 * @file Top alignment icon for object positioning
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Bars aligned to top edge baseline with horizontal reference line */
export function AlignTopIcon({
  size,
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const resolvedSize = resolveSize(size);
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      style={{ width: resolvedSize, height: resolvedSize, ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <line x1="2" y1="2" x2="12" y2="2" />
      <line x1="5" y1="4" x2="5" y2="12" />
      <line x1="9" y1="4" x2="9" y2="9" />
    </svg>
  );
}
