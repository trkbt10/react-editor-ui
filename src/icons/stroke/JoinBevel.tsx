import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function JoinBevelIcon({
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
      strokeWidth="1.5"
      style={style}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path d="M4 20L4 8L8 4L20 4" strokeDasharray="2 2" />
      <path d="M6 18L6 8L10 6L18 6" />
    </svg>
  );
}
