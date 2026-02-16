/**
 * @file Align end icon for arrowhead alignment
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Arrow aligned to path end with vertical line at end */
export function AlignEndIcon({
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
      <line x1="20" y1="4" x2="20" y2="20" />
      <polygon points="16,8 6,12 16,16" fill={color} />
    </svg>
  );
}
