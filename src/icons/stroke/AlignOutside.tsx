import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function StrokeAlignOutsideIcon({
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
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1"
      style={style}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <rect x="8" y="8" width="8" height="8" strokeDasharray="2 2" />
      <rect x="6" y="6" width="12" height="12" strokeWidth="3" />
    </svg>
  );
}
