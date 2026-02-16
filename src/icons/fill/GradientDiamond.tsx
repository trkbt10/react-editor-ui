import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function GradientDiamondIcon({
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
      <path d="M7 2 L12 7 L7 12 L2 7 Z" fill="url(#diamond-grad)" />
      <defs>
        <radialGradient id="diamond-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  );
}
