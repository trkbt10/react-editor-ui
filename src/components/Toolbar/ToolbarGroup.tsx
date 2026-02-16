/**
 * @file ToolbarGroup component - Groups toolbar items together
 */

import type { ReactNode, CSSProperties } from "react";
import { SPACE_SM } from "../../constants/styles";
import { useToolbarOrientation } from "./Toolbar";

export type ToolbarGroupProps = {
  children: ReactNode;
  className?: string;
};

/** Container for grouping related toolbar buttons together */
export function ToolbarGroup({ children, className }: ToolbarGroupProps) {
  const toolbarOrientation = useToolbarOrientation();
  const isVertical = toolbarOrientation === "vertical";

  const style: CSSProperties = {
    display: "flex",
    flexDirection: isVertical ? "column" : "row",
    alignItems: "center",
    gap: SPACE_SM,
  };

  return (
    <div role="group" className={className} style={style}>
      {children}
    </div>
  );
}
