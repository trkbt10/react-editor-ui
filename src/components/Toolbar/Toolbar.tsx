/**
 * @file Toolbar component - Container for toolbar items
 */

import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  SIZE_TOOLBAR_HEIGHT,
  SPACE_SM,
} from "../../constants/styles";

export type ToolbarProps = {
  children: ReactNode;
  className?: string;
};

export function Toolbar({ children, className }: ToolbarProps) {
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    height: SIZE_TOOLBAR_HEIGHT,
    padding: `0 ${SPACE_SM}`,
    backgroundColor: COLOR_SURFACE,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    gap: SPACE_SM,
  };

  return (
    <div role="toolbar" className={className} style={style}>
      {children}
    </div>
  );
}
