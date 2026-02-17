/**
 * @file ToolbarDivider component - Divider for toolbar (adapts to orientation)
 */

import { memo, useMemo } from "react";
import type { CSSProperties } from "react";
import {
  COLOR_DIVIDER,
  SIZE_DIVIDER_WIDTH,
  SIZE_ICON_MD,
  SPACE_SM,
} from "../../themes/styles";
import { useToolbarOrientation } from "./Toolbar";

export type ToolbarDividerProps = {
  className?: string;
};

/** Visual separator line between toolbar button groups */
export const ToolbarDivider = memo(function ToolbarDivider({ className }: ToolbarDividerProps) {
  const toolbarOrientation = useToolbarOrientation();
  const isVerticalToolbar = toolbarOrientation === "vertical";

  const style = useMemo<CSSProperties>(
    () => {
      // In vertical toolbar, divider is horizontal; in horizontal toolbar, divider is vertical
      if (isVerticalToolbar) {
        return { width: SIZE_ICON_MD, height: SIZE_DIVIDER_WIDTH, backgroundColor: COLOR_DIVIDER, margin: `${SPACE_SM} 0`, flexShrink: 0 };
      }
      return { width: SIZE_DIVIDER_WIDTH, height: SIZE_ICON_MD, backgroundColor: COLOR_DIVIDER, margin: `0 ${SPACE_SM}`, flexShrink: 0 };
    },
    [isVerticalToolbar],
  );

  return (
    <div
      role="separator"
      aria-orientation={isVerticalToolbar ? "horizontal" : "vertical"}
      className={className}
      style={style}
    />
  );
});
