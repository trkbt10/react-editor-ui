/**
 * @file Open arrow icon for chevron-style arrowheads
 */

import type { IconProps } from "../types";

/** Line with open V-shaped chevron arrowhead */
export function ArrowOpenIcon({
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  return (
    <svg
      width="32"
      height="12"
      viewBox="0 0 48 12"
      fill="none"
      stroke={color}
      strokeWidth="2"
      style={style}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <line x1="4" y1="6" x2="32" y2="6" />
      <polyline points="34,1 44,6 34,11" fill="none" />
    </svg>
  );
}
