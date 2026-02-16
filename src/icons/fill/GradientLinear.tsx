/**
 * @file Linear gradient type icon for straight-line color transitions
 */

import type { IconProps } from "../types";
import { resolveSize } from "../utils";

/** Rectangle with left-to-right linear gradient showing directional fade */
export function GradientLinearIcon({
  size,
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const resolvedSize = resolveSize(size);
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      style={{ width: resolvedSize, height: resolvedSize, ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <rect x="2" y="2" width="10" height="10" rx="1" fill="url(#linear-grad)" />
      <defs>
        <linearGradient id="linear-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="100%" stopColor="currentColor" />
        </linearGradient>
      </defs>
    </svg>
  );
}
