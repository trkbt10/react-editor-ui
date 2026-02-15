import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function RotationIcon({
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
      viewBox="0 0 12 12"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      style={style}
      className={className}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    >
      <path d="M1.5 4.5V2h2.5" />
      <path d="M10.5 6a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 4.5-4.5" />
    </svg>
  );
}
