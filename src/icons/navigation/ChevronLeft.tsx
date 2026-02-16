/**
 * @file Left chevron for back navigation and previous actions
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Left-pointing angle bracket for previous/back navigation */
export function ChevronLeftIcon({
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
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
