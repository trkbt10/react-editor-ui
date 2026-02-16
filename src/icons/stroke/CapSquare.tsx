import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function CapSquareIcon({
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
      {/* Thick stroke with square extended ends */}
      {/* Center stroke body */}
      <rect x="4" y="5" width="8" height="6" />
      {/* Left extension (square cap) */}
      <rect x="1" y="5" width="3" height="6" opacity="0.5" />
      {/* Right extension (square cap) */}
      <rect x="12" y="5" width="3" height="6" opacity="0.5" />
    </svg>
  );
}
