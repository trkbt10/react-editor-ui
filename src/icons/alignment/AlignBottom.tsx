import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export function AlignBottomIcon({
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
      <line x1="2" y1="12" x2="12" y2="12" />
      <line x1="5" y1="2" x2="5" y2="10" />
      <line x1="9" y1="5" x2="9" y2="10" />
    </svg>
  );
}
