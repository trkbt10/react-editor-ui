import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function FlipVerticalIcon({
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
      strokeWidth="1.5"
      style={style}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path d="M2 7h10" />
      <path d="M4 4l3-2 3 2" />
      <path d="M4 10l3 2 3-2" />
    </svg>
  );
}
