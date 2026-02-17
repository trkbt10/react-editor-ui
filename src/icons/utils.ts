/**
 * @file Icon utility functions for size resolution
 */

import {
  SIZE_ICON_SM,
  SIZE_ICON_MD,
  SIZE_ICON_LG,
} from "../themes/styles";
import type { IconProps } from "./types";

const sizeMap = {
  sm: SIZE_ICON_SM,
  md: SIZE_ICON_MD,
  lg: SIZE_ICON_LG,
} as const;

/**
 * Resolves size prop to CSS value
 * @param size - "sm" | "md" | "lg" or number (px)
 * @returns CSS size value (e.g., "var(--rei-size-icon-md, 14px)" or "16px")
 */
export function resolveSize(size: IconProps["size"]): string {
  if (size === undefined) {
    return SIZE_ICON_MD;
  }
  if (typeof size === "number") {
    return `${size}px`;
  }
  return sizeMap[size];
}
