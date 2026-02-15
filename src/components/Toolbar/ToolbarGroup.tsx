/**
 * @file ToolbarGroup component - Groups toolbar items together
 */

import type { ReactNode, CSSProperties } from "react";
import { SPACE_XS } from "../../constants/styles";

export type ToolbarGroupProps = {
  children: ReactNode;
  className?: string;
};

export function ToolbarGroup({ children, className }: ToolbarGroupProps) {
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_XS,
  };

  return (
    <div role="group" className={className} style={style}>
      {children}
    </div>
  );
}
