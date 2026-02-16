/**
 * @file Smooth icon for dynamic stroke settings
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Smooth curve representing smoothing effect of a dynamic stroke */
export function SmoothIcon({
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
      <path d="M3 17c3.5-6 8-6 10.5 0s7-6 7.5-6" />
    </svg>
  );
}
