import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function FillVideoIcon({
  size,
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: IconProps) {
  const resolvedSize = resolveSize(size);
  return (
    <svg
      width={resolvedSize}
      height={resolvedSize}
      viewBox="0 0 14 14"
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      style={{ display: "block", ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <rect x="2" y="3" width="8" height="8" rx="1.5" />
      <path d="M10 6L12.5 4.5V9.5L10 8" fill={color} stroke="none" />
      <path d="M10 6L12.5 4.5V9.5L10 8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
