/**
 * @file Diamond terminator icon for rhombus endings
 */

import type { IconProps } from "../types";

/** Line ending with filled diamond/rhombus terminator */
export function ArrowDiamondIcon({
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
      <line x1="4" y1="6" x2="30" y2="6" />
      <polygon points="38,1 44,6 38,11 32,6" fill={color} stroke="none" />
    </svg>
  );
}
