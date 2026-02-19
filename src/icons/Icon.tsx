/**
 * @file Icon wrapper component for SVG icons
 */

import type { FC, SVGProps, CSSProperties } from "react";
import { SIZE_ICON_SM, SIZE_ICON_MD, SIZE_ICON_LG } from "../themes/styles";

export type IconSize = "sm" | "md" | "lg" | number;

export type IconProps = {
  size?: IconSize;
  color?: string;
  style?: CSSProperties;
  className?: string;
  "aria-label"?: string;
};

const sizeMap = {
  sm: SIZE_ICON_SM,
  md: SIZE_ICON_MD,
  lg: SIZE_ICON_LG,
} as const;

function resolveSize(size?: IconSize): string {
  if (size === undefined) return SIZE_ICON_MD;
  if (typeof size === "number") return `${size}px`;
  return sizeMap[size];
}

/**
 * Creates an icon component from an SVG component
 */
export function createIcon(
  SvgComponent: FC<SVGProps<SVGSVGElement>>,
  displayName?: string,
): FC<IconProps> {
  const Icon: FC<IconProps> = ({
    size,
    color = "currentColor",
    style,
    className,
    "aria-label": ariaLabel,
  }) => {
    const resolvedSize = resolveSize(size);
    return (
      <SvgComponent
        style={{ width: resolvedSize, height: resolvedSize, ...style }}
        className={className}
        stroke={color}
        aria-hidden={!ariaLabel}
        aria-label={ariaLabel}
      />
    );
  };

  if (displayName) {
    Icon.displayName = displayName;
  }

  return Icon;
}
