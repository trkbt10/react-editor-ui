import type { IconProps } from "../types";
import { resolveSize } from "../utils";

export type LockIconProps = IconProps & {
  locked: boolean;
};

export function LockIcon({
  locked,
  size,
  color = "currentColor",
  style,
  className,
  "aria-label": ariaLabel,
}: LockIconProps) {
  const resolvedSize = resolveSize(size);

  if (locked) {
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
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  }

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
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}
