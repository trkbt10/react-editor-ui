/**
 * @file LibraryListItem - List item with thumbnail, label, and chevron
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_ICON,
  COLOR_BORDER,
  COLOR_SURFACE_RAISED,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
  SIZE_ICON_MD,
  SIZE_THUMBNAIL_MD,
  SIZE_DIVIDER_WIDTH,
  SPACE_SM,
  SPACE_MD,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";
import type { LibraryListItemProps } from "./types";
import { isCategory } from "./types";

const thumbnailContainerStyle: CSSProperties = {
  width: SIZE_THUMBNAIL_MD,
  height: SIZE_THUMBNAIL_MD,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLOR_SURFACE_RAISED,
  borderRadius: RADIUS_SM,
  overflow: "hidden",
};

const labelStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  fontSize: SIZE_FONT_SM,
  color: COLOR_TEXT,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const chevronStyle: CSSProperties = {
  flexShrink: 0,
  width: SIZE_ICON_MD,
  height: SIZE_ICON_MD,
  color: COLOR_ICON,
};

export const LibraryListItem = memo(function LibraryListItem({
  node,
  onClick,
  renderThumbnail,
}: LibraryListItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const showChevron = isCategory(node);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_MD,
      padding: SPACE_SM,
      backgroundColor: isHovered ? COLOR_HOVER : "transparent",
      borderBottom: `${SIZE_DIVIDER_WIDTH} solid ${COLOR_BORDER}`,
      cursor: "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [isHovered],
  );

  const handlePointerEnter = useCallback(() => setIsHovered(true), []);
  const handlePointerLeave = useCallback(() => setIsHovered(false), []);

  const thumbnail = renderThumbnail ? renderThumbnail(node) : node.thumbnail;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={containerStyle}
    >
      <div style={thumbnailContainerStyle}>
        {thumbnail ?? (
          <span style={{ color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_XS }}>
            {node.label.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <span style={labelStyle}>{node.label}</span>
      {showChevron && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={chevronStyle}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </div>
  );
});
