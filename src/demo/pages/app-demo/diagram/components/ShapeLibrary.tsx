/**
 * @file ShapeLibrary - Left sidebar with searchable shape palette and DnD
 */

import { memo, useMemo, useCallback, type ReactNode, type DragEvent } from "react";
import {
  LuSquare,
  LuCircle,
  LuDiamond,
  LuHexagon,
  LuTriangle,
  LuDatabase,
} from "react-icons/lu";

import { LibraryBrowser } from "../../../../../components/LibraryBrowser/LibraryBrowser";
import type { LibraryNode, LibraryLeafItem } from "../../../../../components/LibraryBrowser/types";
import { shapeLibrary } from "../mockData";
import type { NodeType } from "../types";

// =============================================================================
// Shape Icon Mapping
// =============================================================================

function getShapeIcon(type: NodeType, size: number = 24): ReactNode {
  const iconProps = { size, strokeWidth: 1.5 };
  switch (type) {
    case "rectangle":
    case "rounded-rect":
      return <LuSquare {...iconProps} />;
    case "ellipse":
      return <LuCircle {...iconProps} />;
    case "diamond":
      return <LuDiamond {...iconProps} />;
    case "hexagon":
      return <LuHexagon {...iconProps} />;
    case "triangle":
      return <LuTriangle {...iconProps} />;
    case "cylinder":
      return <LuDatabase {...iconProps} />;
    case "parallelogram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 18L9 6h9l-3 12H6z" />
        </svg>
      );
    default:
      return <LuSquare {...iconProps} />;
  }
}

// =============================================================================
// Category Labels
// =============================================================================

const categoryLabels: Record<string, string> = {
  basic: "Basic Shapes",
  flowchart: "Flowchart",
  uml: "UML",
  misc: "Miscellaneous",
};

// =============================================================================
// Main Component
// =============================================================================

export const ShapeLibrary = memo(function ShapeLibrary() {
  // Convert shapeLibrary data to LibraryNode format
  const libraryItems = useMemo((): LibraryNode[] => {
    const groups: Record<string, LibraryLeafItem[]> = {};

    for (const shape of shapeLibrary) {
      if (!groups[shape.category]) {
        groups[shape.category] = [];
      }
      groups[shape.category].push({
        id: shape.type,
        type: "item",
        label: shape.label,
        thumbnail: getShapeIcon(shape.type as NodeType),
        metadata: {
          type: shape.type,
          width: shape.defaultWidth,
          height: shape.defaultHeight,
        },
      });
    }

    return Object.entries(groups).map(([category, items]) => ({
      id: category,
      type: "category" as const,
      label: categoryLabels[category] ?? category,
      children: items,
    }));
  }, []);

  const handleDragStart = useCallback(
    (item: LibraryLeafItem, e: DragEvent<HTMLDivElement>) => {
      e.dataTransfer.setData(
        "application/diagram-shape",
        JSON.stringify(item.metadata),
      );
    },
    [],
  );

  return (
    <LibraryBrowser
      items={libraryItems}
      searchPlaceholder="Search shapes..."
      showFilterButton={false}
      onDragStart={handleDragStart}
      emptyMessage="No shapes"
      searchEmptyMessage="No shapes found"
    />
  );
});
