/**
 * @file ToolbarGroup component - Groups toolbar items together
 */

import { memo, useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";
import { SPACE_SM } from "../../themes/styles";
import { useToolbarOrientation } from "./Toolbar";

export type ToolbarGroupProps = {
  children: ReactNode;
  className?: string;
};

/** Container for grouping related toolbar buttons together */
export const ToolbarGroup = memo(function ToolbarGroup({ children, className }: ToolbarGroupProps) {
  const toolbarOrientation = useToolbarOrientation();
  const isVertical = toolbarOrientation === "vertical";

  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: isVertical ? "column" : "row",
      alignItems: "center",
      gap: SPACE_SM,
    }),
    [isVertical],
  );

  return (
    <div role="group" className={className} style={style}>
      {children}
    </div>
  );
});
