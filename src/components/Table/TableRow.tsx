/**
 * @file Table row component
 */

import type { CSSProperties } from "react";
import { memo, useMemo, useState, useCallback } from "react";
import type { TableRowProps } from "./types";
import {
  TABLE_ROW_STYLE,
  TABLE_ROW_HOVER_BG,
  TABLE_ROW_SELECTED_BG,
} from "./styles";

/**
 * Table row component with hover and selection states
 */
export const TableRow = memo(function TableRow({
  rowIndex,
  selected = false,
  onClick,
  children,
  style,
  className,
  "data-index": dataIndex,
}: TableRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const rowStyle = useMemo<CSSProperties>(() => {
    const baseStyle: CSSProperties = {
      ...TABLE_ROW_STYLE,
    };

    if (selected) {
      baseStyle.backgroundColor = TABLE_ROW_SELECTED_BG;
    } else if (isHovered) {
      baseStyle.backgroundColor = TABLE_ROW_HOVER_BG;
    }

    if (onClick) {
      baseStyle.cursor = "pointer";
    }

    if (style) {
      Object.assign(baseStyle, style);
    }

    return baseStyle;
  }, [selected, isHovered, onClick, style]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(rowIndex);
    }
  }, [onClick, rowIndex]);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  return (
    <div
      style={rowStyle}
      className={className}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      data-index={dataIndex ?? rowIndex}
      role="row"
    >
      {children}
    </div>
  );
});
