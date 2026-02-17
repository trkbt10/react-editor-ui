/**
 * @file LibraryBrowser type definitions
 */

import type { ReactNode, DragEvent } from "react";

// =============================================================================
// Data Types
// =============================================================================

/**
 * Category node that can contain children (subcategories or items)
 */
export type LibraryCategoryItem = {
  id: string;
  type: "category";
  label: string;
  thumbnail?: ReactNode;
  children: LibraryNode[];
};

/**
 * Leaf item that represents an actual library asset
 */
export type LibraryLeafItem = {
  id: string;
  type: "item";
  label: string;
  thumbnail?: ReactNode;
  metadata?: Record<string, unknown>;
  draggable?: boolean;
};

/**
 * Union type for all library nodes
 */
export type LibraryNode = LibraryCategoryItem | LibraryLeafItem;

/**
 * Navigation path entry for breadcrumb
 */
export type NavigationPathEntry = {
  id: string;
  label: string;
};

// =============================================================================
// Type Guards
// =============================================================================

/**
 * Type guard to check if a node is a category
 */
export function isCategory(node: LibraryNode): node is LibraryCategoryItem {
  return node.type === "category";
}

/**
 * Type guard to check if a node is a leaf item
 */
export function isLeafItem(node: LibraryNode): node is LibraryLeafItem {
  return node.type === "item";
}

// =============================================================================
// Component Props
// =============================================================================

export type LibraryBrowserProps = {
  /** Hierarchical library data */
  items: LibraryNode[];
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Show filter button (default: false) */
  showFilterButton?: boolean;
  /** Filter button click handler */
  onFilterClick?: () => void;
  /** Custom thumbnail renderer */
  renderThumbnail?: (node: LibraryNode) => ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Search empty state message */
  searchEmptyMessage?: string;
  /** Drag start handler for leaf items */
  onDragStart?: (item: LibraryLeafItem, e: DragEvent<HTMLDivElement>) => void;
  /** Item click handler for leaf items */
  onItemClick?: (item: LibraryLeafItem) => void;
  /** Grid column count (default: 2) */
  columns?: number;
  /** Container height */
  height?: number | string;
  /** Additional className */
  className?: string;
};

export type LibraryHeaderProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchPlaceholder: string;
  showFilterButton: boolean;
  onFilterClick?: () => void;
  navigationPath: NavigationPathEntry[];
  onNavigateBack: () => void;
  onNavigateTo: (index: number) => void;
};

export type LibraryListViewProps = {
  items: LibraryNode[];
  onCategoryClick: (category: LibraryCategoryItem) => void;
  onItemClick?: (item: LibraryLeafItem) => void;
  renderThumbnail?: (node: LibraryNode) => ReactNode;
};

export type LibraryGridViewProps = {
  items: LibraryLeafItem[];
  columns: number;
  onItemClick?: (item: LibraryLeafItem) => void;
  onDragStart?: (item: LibraryLeafItem, e: DragEvent<HTMLDivElement>) => void;
  renderThumbnail?: (node: LibraryNode) => ReactNode;
};

export type LibraryListItemProps = {
  node: LibraryNode;
  onClick: () => void;
  renderThumbnail?: (node: LibraryNode) => ReactNode;
};

export type LibraryGridItemProps = {
  item: LibraryLeafItem;
  onClick?: () => void;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  renderThumbnail?: (node: LibraryNode) => ReactNode;
};

export type LibraryEmptyStateProps = {
  message: string;
};
