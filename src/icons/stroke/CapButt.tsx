import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function CapButtIcon({
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
      {/* Thick stroke with flat ends (butt cap) */}
      <rect x="2" y="5" width="12" height="6" />
    </svg>
  );
}
