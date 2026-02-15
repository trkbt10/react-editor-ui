import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function FillGradientIcon({
  size,
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
      style={{ display: "block", ...style }}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <defs>
        <linearGradient id="fill-gradient-icon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="10" height="10" rx="2" fill="url(#fill-gradient-icon)" />
    </svg>
  );
}
