import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function StrokeAlignInsideIcon({
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
      {/* Shape boundary (L-shape corner) */}
      <path
        d="M2 14V2h12"
        stroke={color}
        strokeWidth="1"
        opacity="0.35"
        fill="none"
      />
      {/* Thick stroke INSIDE the shape boundary */}
      <path
        d="M5 11V5h6"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="square"
        fill="none"
      />
    </svg>
  );
}
