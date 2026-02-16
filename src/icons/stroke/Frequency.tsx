/**
 * @file Frequency icon for dynamic stroke settings
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Zigzag waveform representing frequency of a dynamic stroke */
export function FrequencyIcon({
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
      <path d="M4 12h4l3-9 6 18 3-9h4" />
    </svg>
  );
}
