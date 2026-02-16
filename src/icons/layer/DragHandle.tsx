/**
 * @file Drag handle icon for layer reordering
 */

import type { IconProps } from "../types";

/** Six-dot grip pattern (2x3) for drag-and-drop reordering */
export function DragHandleIcon({
  size = 10,
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  // Preserve 10:14 aspect ratio
  const width = typeof size === "number" ? size : 10;
  const height = Math.round(width * 1.4);
  return (
    <svg
      viewBox="0 0 10 14"
      fill={color}
      style={{ width, height, ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <circle cx="3" cy="2" r="1.5" />
      <circle cx="7" cy="2" r="1.5" />
      <circle cx="3" cy="7" r="1.5" />
      <circle cx="7" cy="7" r="1.5" />
      <circle cx="3" cy="12" r="1.5" />
      <circle cx="7" cy="12" r="1.5" />
    </svg>
  );
}
