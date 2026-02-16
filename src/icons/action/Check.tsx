/**
 * @file Checkmark icon for confirmation and selection states
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Checkmark icon indicating success, completion, or selected state */
export function CheckIcon({
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
