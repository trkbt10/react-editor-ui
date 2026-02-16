/**
 * @file Rotation icon for angular transformation
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Circular arrow indicating clockwise rotation transformation */
export function RotationIcon({
  size,
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const resolvedSize = resolveSize(size);
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ width: resolvedSize, height: resolvedSize, ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path d="M10 6A4 4 0 1 1 6 2" />
      <polyline points="3.5,2 6,2 6,4.5" />
    </svg>
  );
}
