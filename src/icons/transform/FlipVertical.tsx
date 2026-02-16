/**
 * @file Vertical flip icon for up-down mirroring
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Horizontal axis with arrows pointing outward for vertical reflection */
export function FlipVerticalIcon({
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
      <path d="M2 7h10" />
      <path d="M4 4l3-2 3 2" />
      <path d="M4 10l3 2 3-2" />
    </svg>
  );
}
