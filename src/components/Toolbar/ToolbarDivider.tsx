/**
 * @file ToolbarDivider component - Vertical divider for toolbar
 */

import type { CSSProperties } from "react";
import {
  COLOR_DIVIDER,
  SIZE_DIVIDER_WIDTH,
  SIZE_ICON_MD,
  SPACE_SM,
} from "../../constants/styles";

export type ToolbarDividerProps = {
  className?: string;
};






export function ToolbarDivider({ className }: ToolbarDividerProps) {
  const style: CSSProperties = {
    width: SIZE_DIVIDER_WIDTH,
    height: SIZE_ICON_MD,
    backgroundColor: COLOR_DIVIDER,
    margin: `0 ${SPACE_SM}`,
    flexShrink: 0,
  };

  return (
    <div role="separator" aria-orientation="vertical" className={className} style={style} />
  );
}
