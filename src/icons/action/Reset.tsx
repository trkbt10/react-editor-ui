/**
 * @file Reset icon with crosshair for returning to default/center
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Crosshair with dashed circle for resetting position to origin */
export function ResetIcon({
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
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      style={{ width: resolvedSize, height: resolvedSize, ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path d="M7 2v10M2 7h10" />
      <circle cx="7" cy="7" r="5" strokeDasharray="2 2" />
    </svg>
  );
}
