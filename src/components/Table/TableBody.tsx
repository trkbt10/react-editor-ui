/**
 * @file Table body component
 */

import type { CSSProperties } from "react";
import { memo, useMemo } from "react";
import type { TableBodyProps } from "./types";

const BASE_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

/**
 * Table body wrapper component
 */
export const TableBody = memo(function TableBody({
  children,
  style,
  className,
}: TableBodyProps) {
  const bodyStyle = useMemo<CSSProperties>(() => {
    if (!style) {
      return BASE_STYLE;
    }
    return { ...BASE_STYLE, ...style };
  }, [style]);

  return (
    <div style={bodyStyle} className={className} role="rowgroup">
      {children}
    </div>
  );
});
