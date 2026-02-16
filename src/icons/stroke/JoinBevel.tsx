/**
 * @file Bevel join icon for cut corner connections
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** L-corner with diagonal flat edge at the join */
export function JoinBevelIcon({
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
      {/* Two thick strokes meeting with beveled corner */}
      <path d="M3 14V6l3-3h8v3H6v8H3z" />
    </svg>
  );
}
