/**
 * @file LibraryBrowser - Hierarchical library browser with search and navigation
 *
 * @description
 * A Figma-style library browser component that supports hierarchical navigation,
 * search filtering, and drag-and-drop. Automatically switches between list view
 * (for categories) and grid view (for leaf items).
 *
 * @example
 * ```tsx
 * import { LibraryBrowser, type LibraryNode } from "react-editor-ui/LibraryBrowser";
 *
 * const items: LibraryNode[] = [
 *   {
 *     id: "shapes",
 *     type: "category",
 *     label: "Basic Shapes",
 *     children: [
 *       { id: "rect", type: "item", label: "Rectangle" },
 *       { id: "circle", type: "item", label: "Circle" },
 *     ],
 *   },
 * ];
 *
 * <LibraryBrowser
 *   items={items}
 *   searchPlaceholder="Search library..."
 *   onDragStart={(item, e) => {
 *     e.dataTransfer.setData("application/json", JSON.stringify(item.metadata));
 *   }}
 * />
 * ```
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { CSSProperties } from "react";
import { COLOR_SURFACE, SPACE_LG } from "../../themes/styles";
import type {
  LibraryBrowserProps,
  LibraryNode,
  LibraryCategoryItem,
  LibraryLeafItem,
  NavigationPathEntry,
} from "./types";
import { isCategory, isLeafItem } from "./types";
import { LibraryHeader } from "./LibraryHeader";
import { LibraryListView } from "./LibraryListView";
import { LibraryGridView } from "./LibraryGridView";
import { LibraryEmptyState } from "./LibraryEmptyState";

// =============================================================================
// Helpers
// =============================================================================

/**
 * Recursively search all items and return flat list of leaf matches
 */
function flatSearchItems(items: LibraryNode[], query: string): LibraryLeafItem[] {
  const results: LibraryLeafItem[] = [];

  function searchRecursive(nodes: LibraryNode[]): void {
    for (const node of nodes) {
      if (isCategory(node)) {
        // Also match category name to include all children
        if (node.label.toLowerCase().includes(query)) {
          // Add all leaf items from this category
          collectLeafItems(node.children, results);
        } else {
          searchRecursive(node.children);
        }
      } else if (node.label.toLowerCase().includes(query)) {
        results.push(node);
      }
    }
  }

  function collectLeafItems(nodes: LibraryNode[], target: LibraryLeafItem[]): void {
    for (const node of nodes) {
      if (isCategory(node)) {
        collectLeafItems(node.children, target);
      } else {
        target.push(node);
      }
    }
  }

  searchRecursive(items);
  return results;
}

// =============================================================================
// Styles
// =============================================================================

const contentContainerStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
  padding: `0 ${SPACE_LG} ${SPACE_LG}`,
};

// =============================================================================
// Component
// =============================================================================

export const LibraryBrowser = memo(function LibraryBrowser({
  items,
  searchPlaceholder = "Search...",
  showFilterButton = false,
  onFilterClick,
  renderThumbnail,
  emptyMessage = "No items",
  searchEmptyMessage = "No results found",
  onDragStart,
  onItemClick,
  columns = 2,
  height,
  className,
}: LibraryBrowserProps) {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationPath, setNavigationPath] = useState<NavigationPathEntry[]>([]);

  // Container style with dynamic height
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      backgroundColor: COLOR_SURFACE,
      overflow: "hidden",
      height: height ?? "100%",
    }),
    [height],
  );

  // Navigate to current location based on path
  const currentItems = useMemo(() => {
    return navigationPath.reduce<LibraryNode[]>((acc, entry) => {
      const found = acc.find((node) => node.id === entry.id);
      if (found && isCategory(found)) {
        return found.children;
      }
      return acc;
    }, items);
  }, [items, navigationPath]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return currentItems;
    }
    // When searching, search from root and return flat results
    return flatSearchItems(items, query);
  }, [currentItems, items, searchQuery]);

  // Determine view mode based on content
  const viewMode = useMemo((): "list" | "grid" => {
    // If searching, always show grid (flat results)
    if (searchQuery.trim()) {
      return "grid";
    }
    // If current items contain any categories, show list
    const hasCategories = filteredItems.some(isCategory);
    return hasCategories ? "list" : "grid";
  }, [filteredItems, searchQuery]);

  // Extract leaf items for grid view
  const leafItems = useMemo(
    () => filteredItems.filter(isLeafItem),
    [filteredItems],
  );

  // Handlers
  const handleNavigateBack = useCallback(() => {
    setNavigationPath((prev) => prev.slice(0, -1));
  }, []);

  const handleNavigateTo = useCallback((index: number) => {
    setNavigationPath((prev) => prev.slice(0, index + 1));
  }, []);

  const handleCategoryClick = useCallback((category: LibraryCategoryItem) => {
    setNavigationPath((prev) => [...prev, { id: category.id, label: category.label }]);
  }, []);

  // Render content
  const renderContent = () => {
    if (filteredItems.length === 0) {
      return (
        <LibraryEmptyState
          message={searchQuery.trim() ? searchEmptyMessage : emptyMessage}
        />
      );
    }

    if (viewMode === "list") {
      return (
        <LibraryListView
          items={filteredItems}
          onCategoryClick={handleCategoryClick}
          onItemClick={onItemClick}
          renderThumbnail={renderThumbnail}
        />
      );
    }

    return (
      <LibraryGridView
        items={leafItems}
        columns={columns}
        onItemClick={onItemClick}
        onDragStart={onDragStart}
        renderThumbnail={renderThumbnail}
      />
    );
  };

  return (
    <div className={className} style={containerStyle}>
      <LibraryHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={searchPlaceholder}
        showFilterButton={showFilterButton}
        onFilterClick={onFilterClick}
        navigationPath={navigationPath}
        onNavigateBack={handleNavigateBack}
        onNavigateTo={handleNavigateTo}
      />
      <div style={contentContainerStyle}>{renderContent()}</div>
    </div>
  );
});
