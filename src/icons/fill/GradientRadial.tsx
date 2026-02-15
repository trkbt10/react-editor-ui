import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function GradientRadialIcon({
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
      fill="none"
      style={style}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <rect x="2" y="2" width="10" height="10" rx="1" fill="url(#radial-grad)" />
      <defs>
        <radialGradient id="radial-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
}
