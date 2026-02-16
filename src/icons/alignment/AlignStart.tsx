/**
 * @file Align start icon for arrowhead alignment
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Arrow aligned to path start with vertical line at start */
export function AlignStartIcon({
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
      <line x1="4" y1="4" x2="4" y2="20" />
      <polygon points="8,8 18,12 8,16" fill={color} />
    </svg>
  );
}
