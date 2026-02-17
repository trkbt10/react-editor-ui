/**
 * @file ShapeLibrary - Left sidebar with searchable shape palette and DnD
 */

import { memo, useState, useMemo, useCallback, type CSSProperties, type DragEvent, type ReactNode } from "react";
import {
  LuSquare,
  LuCircle,
  LuDiamond,
  LuHexagon,
  LuTriangle,
  LuDatabase,
} from "react-icons/lu";

import { SearchInput } from "../../../../../components/SearchInput/SearchInput";
import { SectionHeader } from "../../../../../components/SectionHeader/SectionHeader";
import { shapeLibrary } from "../mockData";
import type { NodeType, ShapeDefinition } from "../types";

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--rei-color-surface)",
  overflow: "hidden",
};

const searchContainerStyle: CSSProperties = {
  padding: 12,
};

const shapesContainerStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
  padding: "0 12px 12px",
};

const shapeGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gap: 8,
};

const shapeItemStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "12px 8px",
  backgroundColor: "var(--rei-color-surface-raised)",
  border: "1px solid var(--rei-color-border)",
  borderRadius: 6,
  cursor: "grab",
  transition: "all 0.15s ease",
  userSelect: "none",
};

const shapeItemHoverStyle: CSSProperties = {
  ...shapeItemStyle,
  backgroundColor: "var(--rei-color-selected)",
  borderColor: "var(--rei-color-primary)",
};

const shapeLabelStyle: CSSProperties = {
  fontSize: 11,
  color: "var(--rei-color-text-muted)",
  textAlign: "center",
  lineHeight: 1.2,
};

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
// Shape Item Component
// =============================================================================

type ShapeItemProps = {
  shape: ShapeDefinition;
};

const ShapeItem = memo(function ShapeItem({ shape }: ShapeItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData(
        "application/diagram-shape",
        JSON.stringify({
          type: shape.type,
          width: shape.defaultWidth,
          height: shape.defaultHeight,
        }),
      );
    },
    [shape],
  );

  const handlePointerEnter = useCallback(() => setIsHovered(true), []);
  const handlePointerLeave = useCallback(() => setIsHovered(false), []);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={isHovered ? shapeItemHoverStyle : shapeItemStyle}
    >
      {getShapeIcon(shape.type)}
      <span style={shapeLabelStyle}>{shape.label}</span>
    </div>
  );
});

// =============================================================================
// Main Component
// =============================================================================

export const ShapeLibrary = memo(function ShapeLibrary() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredShapes = useMemo(() => {
    if (!searchQuery.trim()) {
      return shapeLibrary;
    }
    const query = searchQuery.toLowerCase();
    return shapeLibrary.filter(
      (shape) =>
        shape.label.toLowerCase().includes(query) ||
        shape.type.toLowerCase().includes(query) ||
        shape.category.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const groupedShapes = useMemo(() => {
    const groups: Record<string, ShapeDefinition[]> = {};
    for (const shape of filteredShapes) {
      if (!groups[shape.category]) {
        groups[shape.category] = [];
      }
      groups[shape.category].push(shape);
    }
    return groups;
  }, [filteredShapes]);

  const categoryLabels: Record<string, string> = {
    basic: "Basic Shapes",
    flowchart: "Flowchart",
    uml: "UML",
    misc: "Miscellaneous",
  };

  return (
    <div style={containerStyle}>
      <div style={searchContainerStyle}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search shapes..."
          size="sm"
        />
      </div>

      <div style={shapesContainerStyle}>
        {Object.entries(groupedShapes).map(([category, shapes]) => (
          <div key={category}>
            <SectionHeader title={categoryLabels[category] ?? category} />
            <div style={shapeGridStyle}>
              {shapes.map((shape) => (
                <ShapeItem key={shape.type} shape={shape} />
              ))}
            </div>
          </div>
        ))}

        {filteredShapes.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "var(--rei-color-text-muted)",
              fontSize: 12,
              padding: 20,
            }}
          >
            No shapes found
          </div>
        )}
      </div>
    </div>
  );
});
