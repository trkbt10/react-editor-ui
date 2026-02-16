/**
 * @file ToolbarDivider component - Divider for toolbar (adapts to orientation)
 */

import type { CSSProperties } from "react";
import {
  COLOR_DIVIDER,
  SIZE_DIVIDER_WIDTH,
  SIZE_ICON_MD,
  SPACE_SM,
} from "../../constants/styles";
import { useToolbarOrientation } from "./Toolbar";

export type ToolbarDividerProps = {
  className?: string;
};



export function ToolbarDivider({ className }: ToolbarDividerProps) {
  const toolbarOrientation = useToolbarOrientation();
  const isVerticalToolbar = toolbarOrientation === "vertical";

  // In vertical toolbar, divider is horizontal; in horizontal toolbar, divider is vertical
  const style: CSSProperties = isVerticalToolbar
    ? {
        width: SIZE_ICON_MD,
        height: SIZE_DIVIDER_WIDTH,
        backgroundColor: COLOR_DIVIDER,
        margin: `${SPACE_SM} 0`,
        flexShrink: 0,
      }
    : {
        width: SIZE_DIVIDER_WIDTH,
        height: SIZE_ICON_MD,
        backgroundColor: COLOR_DIVIDER,
        margin: `0 ${SPACE_SM}`,
        flexShrink: 0,
      };

  return (
    <div
      role="separator"
      aria-orientation={isVerticalToolbar ? "horizontal" : "vertical"}
      className={className}
      style={style}
    />
  );
}
