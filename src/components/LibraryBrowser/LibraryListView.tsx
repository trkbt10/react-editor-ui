/**
 * @file LibraryListView - List view for categories
 */

import { memo, useCallback } from "react";
import type { CSSProperties } from "react";
import type { LibraryListViewProps, LibraryNode, LibraryCategoryItem, LibraryLeafItem } from "./types";
import { isCategory } from "./types";
import { LibraryListItem } from "./LibraryListItem";

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

type ListItemWrapperProps = {
  node: LibraryNode;
  onCategoryClick: (category: LibraryCategoryItem) => void;
  onItemClick?: (item: LibraryLeafItem) => void;
  renderThumbnail?: (node: LibraryNode) => React.ReactNode;
};

const ListItemWrapper = memo(function ListItemWrapper({
  node,
  onCategoryClick,
  onItemClick,
  renderThumbnail,
}: ListItemWrapperProps) {
  const handleClick = useCallback(() => {
    if (isCategory(node)) {
      onCategoryClick(node);
    } else {
      onItemClick?.(node);
    }
  }, [node, onCategoryClick, onItemClick]);

  return (
    <LibraryListItem
      node={node}
      onClick={handleClick}
      renderThumbnail={renderThumbnail}
    />
  );
});

export const LibraryListView = memo(function LibraryListView({
  items,
  onCategoryClick,
  onItemClick,
  renderThumbnail,
}: LibraryListViewProps) {
  return (
    <div style={containerStyle}>
      {items.map((node) => (
        <ListItemWrapper
          key={node.id}
          node={node}
          onCategoryClick={onCategoryClick}
          onItemClick={onItemClick}
          renderThumbnail={renderThumbnail}
        />
      ))}
    </div>
  );
});
