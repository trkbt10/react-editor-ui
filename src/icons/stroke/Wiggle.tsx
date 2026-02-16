/**
 * @file Wiggle icon for dynamic stroke settings
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Wavy line representing wiggle effect of a dynamic stroke */
export function WiggleIcon({
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
      <path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0 4 4 6 0" />
    </svg>
  );
}
