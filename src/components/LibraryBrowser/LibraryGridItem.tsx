/**
 * @file LibraryGridItem - Grid item with preview card and label
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { CSSProperties, DragEvent } from "react";
import {
  COLOR_HOVER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_BORDER,
  COLOR_PRIMARY,
  COLOR_SURFACE_RAISED,
  SIZE_FONT_XS,
  SIZE_FONT_LG,
  SIZE_DIVIDER_WIDTH,
  SPACE_SM,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";
import type { LibraryGridItemProps } from "./types";

const thumbnailContainerStyle: CSSProperties = {
  aspectRatio: "4 / 3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLOR_SURFACE_RAISED,
  borderRadius: RADIUS_SM,
  overflow: "hidden",
};

const labelStyle: CSSProperties = {
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  lineHeight: 1.3,
};

export const LibraryGridItem = memo(function LibraryGridItem({
  item,
  onClick,
  onDragStart,
  renderThumbnail,
}: LibraryGridItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isDraggable = item.draggable !== false;

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_SM,
      padding: SPACE_SM,
      backgroundColor: isHovered ? COLOR_HOVER : "transparent",
      border: `${SIZE_DIVIDER_WIDTH} solid ${isHovered ? COLOR_PRIMARY : COLOR_BORDER}`,
      borderRadius: RADIUS_SM,
      cursor: isDraggable ? "grab" : "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}, border-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      userSelect: "none",
    }),
    [isHovered, isDraggable],
  );

  const handlePointerEnter = useCallback(() => setIsHovered(true), []);
  const handlePointerLeave = useCallback(() => setIsHovered(false), []);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      if (!isDraggable) {
        e.preventDefault();
        return;
      }
      e.dataTransfer.effectAllowed = "copy";
      onDragStart?.(e);
    },
    [isDraggable, onDragStart],
  );

  const thumbnail = renderThumbnail ? renderThumbnail(item) : item.thumbnail;

  return (
    <div
      role="button"
      tabIndex={0}
      draggable={isDraggable}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      onDragStart={handleDragStart}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={containerStyle}
    >
      <div style={thumbnailContainerStyle}>
        {thumbnail ?? (
          <span style={{ color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_LG }}>
            {item.label.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span style={labelStyle}>{item.label}</span>
    </div>
  );
});
