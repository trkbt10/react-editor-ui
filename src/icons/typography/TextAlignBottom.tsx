/**
 * @file Text align bottom icon for vertical typography alignment
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Vertical arrow pointing down with downward-facing chevron */
export function TextAlignBottomIcon({
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
      <line x1="12" y1="9" x2="12" y2="21" />
      <polyline points="16 17 12 21 8 17" />
    </svg>
  );
}
