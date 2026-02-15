import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function GradientAngularIcon({
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
      <rect x="2" y="2" width="10" height="10" rx="1" fill="url(#angular-grad)" />
      <defs>
        <linearGradient id="angular-grad" gradientTransform="rotate(45)">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
}
