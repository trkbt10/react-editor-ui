/**
 * @file Square terminator icon for box endings
 */

import type { IconProps } from "../types";

/** Line ending with filled square terminator */
export function ArrowSquareIcon({
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
      <rect x="34" y="2" width="8" height="8" fill={color} stroke="none" />
    </svg>
  );
}
