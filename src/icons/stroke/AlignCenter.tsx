import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function StrokeAlignCenterIcon({
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
      fill="none"
      style={{ width: resolvedSize, height: resolvedSize, ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      {/* Shape boundary (L-shape corner) - centered on stroke */}
      <path
        d="M3.5 12.5V3.5h9"
        stroke={color}
        strokeWidth="1"
        opacity="0.35"
        fill="none"
      />
      {/* Thick stroke CENTERED on the shape boundary */}
      <path
        d="M3.5 12.5V3.5h9"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
}
