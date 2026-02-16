import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function FillImageIcon({
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
      strokeWidth="1.2"
      style={{ width: resolvedSize, height: resolvedSize, display: "block", ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <rect x="2" y="2" width="10" height="10" rx="2" />
      <circle cx="5" cy="5" r="1" fill={color} stroke="none" />
      <path d="M2.5 10L5 7.5L7 9.5L9.5 6.5L12 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
