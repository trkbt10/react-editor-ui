/**
 * @file Triangle arrow icon for filled arrowheads
 */

import type { IconProps } from "../types";

/** Line with solid filled triangular arrowhead */
export function ArrowTriangleIcon({
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
      <polygon points="44,6 32,1 32,11" fill={color} stroke="none" />
    </svg>
  );
}
