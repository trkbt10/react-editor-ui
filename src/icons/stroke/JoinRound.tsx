/**
 * @file Round join icon for smooth corner connections
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** L-corner with curved rounded edge at the join */
export function JoinRoundIcon({
  size,
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const resolvedSize = resolveSize(size);
  return (
    <svg
      viewBox="0 0 16 16"
      fill={color}
      style={{ width: resolvedSize, height: resolvedSize, ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      {/* Two thick strokes meeting with rounded corner */}
      <path d="M3 14V6a3 3 0 0 1 3-3h8v3H6v8H3z" />
    </svg>
  );
}
