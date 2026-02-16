/**
 * @file Text align top icon for vertical typography alignment
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Vertical arrow pointing up with upward-facing chevron */
export function TextAlignTopIcon({
  size,
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const resolvedSize = resolveSize(size);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      style={{ width: resolvedSize, height: resolvedSize, ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <line x1="12" y1="3" x2="12" y2="15" />
      <polyline points="8 7 12 3 16 7" />
    </svg>
  );
}
