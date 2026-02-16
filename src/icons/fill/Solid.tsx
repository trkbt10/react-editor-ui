/**
 * @file Solid fill type icon for flat color fills
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Filled rounded rectangle representing single-color fill */
export function FillSolidIcon({
  size,
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const resolvedSize = resolveSize(size);
  return (
    <svg
      viewBox="0 0 14 14"
      fill={color}
      style={{ width: resolvedSize, height: resolvedSize, display: "block", ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <rect x="2" y="2" width="10" height="10" rx="2" />
    </svg>
  );
}
