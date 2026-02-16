import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function JoinMiterIcon({
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
      {/* Two thick strokes meeting at sharp corner (miter join) */}
      <path d="M3 14V3h11v3H6v8H3z" />
    </svg>
  );
}
