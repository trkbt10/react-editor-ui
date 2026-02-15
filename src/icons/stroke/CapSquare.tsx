import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function CapSquareIcon({
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
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="square" />
      <line x1="2" y1="8" x2="2" y2="16" strokeWidth="1" opacity="0.5" />
      <line x1="22" y1="8" x2="22" y2="16" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
