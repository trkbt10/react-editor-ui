import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function CapRoundIcon({
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
      strokeWidth="2"
      style={style}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <line x1="6" y1="12" x2="18" y2="12" strokeLinecap="round" strokeWidth="4" />
    </svg>
  );
}
