/**
 * @file Text align middle icon for vertical typography alignment
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Vertical arrows pointing both up and down */
export function TextAlignMiddleIcon({
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
      <line x1="12" y1="3" x2="12" y2="9" />
      <line x1="12" y1="15" x2="12" y2="21" />
      <polyline points="8 6 12 3 16 6" />
      <polyline points="16 18 12 21 8 18" />
    </svg>
  );
}
