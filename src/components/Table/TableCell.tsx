/**
 * @file Table cell component
 */

import type { CSSProperties } from "react";
import { memo, useMemo } from "react";
import type { TableCellProps } from "./types";
import { TABLE_CELL_STYLE } from "./styles";

const DEFAULT_MIN_WIDTH = 60;

function getJustifyContent(align: "left" | "center" | "right"): string {
  if (align === "center") {
    return "center";
  }
  if (align === "right") {
    return "flex-end";
  }
  return "flex-start";
}

/**
 * Table cell component
 */
export const TableCell = memo(function TableCell({
  align = "left",
  width,
  minWidth,
  children,
  style,
  className,
}: TableCellProps) {
  const cellStyle = useMemo<CSSProperties>(() => {
    const baseStyle: CSSProperties = {
      ...TABLE_CELL_STYLE,
      width,
      minWidth: minWidth ?? DEFAULT_MIN_WIDTH,
      flex: width ? undefined : 1,
      justifyContent: getJustifyContent(align),
    };

    if (style) {
      Object.assign(baseStyle, style);
    }

    return baseStyle;
  }, [align, width, minWidth, style]);

  return (
    <div style={cellStyle} className={className} role="cell">
      {children}
    </div>
  );
});
