/**
 * @file LibraryGridView - Grid view for leaf items
 */

import { memo, useCallback, useMemo } from "react";
import type { CSSProperties, DragEvent } from "react";
import { SPACE_SM } from "../../themes/styles";
import type { LibraryGridViewProps, LibraryLeafItem } from "./types";
import { LibraryGridItem } from "./LibraryGridItem";

export const LibraryGridView = memo(function LibraryGridView({
  items,
  columns,
  onItemClick,
  onDragStart,
  renderThumbnail,
}: LibraryGridViewProps) {
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: SPACE_SM,
    }),
    [columns],
  );

  const handleDragStart = useCallback(
    (item: LibraryLeafItem) => (e: DragEvent<HTMLDivElement>) => {
      onDragStart?.(item, e);
    },
    [onDragStart],
  );

  const handleClick = useCallback(
    (item: LibraryLeafItem) => () => {
      onItemClick?.(item);
    },
    [onItemClick],
  );

  const itemElements = useMemo(
    () =>
      items.map((item) => (
        <LibraryGridItem
          key={item.id}
          item={item}
          onClick={handleClick(item)}
          onDragStart={handleDragStart(item)}
          renderThumbnail={renderThumbnail}
        />
      )),
    [items, handleClick, handleDragStart, renderThumbnail],
  );

  return <div style={containerStyle}>{itemElements}</div>;
});
