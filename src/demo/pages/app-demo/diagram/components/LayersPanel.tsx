/**
 * @file LayersPanel - Display and manage page elements in a tree structure
 */

import { memo, useContext, useMemo, useCallback, type CSSProperties, type ReactNode } from "react";
import { LuSquare, LuCircle, LuType, LuLayers, LuComponent, LuPalette, LuFrame } from "react-icons/lu";

import { LayerItem } from "../../../../../components/LayerItem/LayerItem";
import { SectionHeader } from "../../../../../components/SectionHeader/SectionHeader";

import { PageContext, SelectionContext } from "../contexts";
import type { DiagramNode, ShapeType, GroupNode, FrameNode, SymbolPart } from "../types";
import { isSymbolInstance, isFrameNode } from "../types";
import { framePresets } from "../mockData";

// =============================================================================
// Type Guards
// =============================================================================

function isGroupNode(node: DiagramNode): node is GroupNode {
  return node.type === "group";
}

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflow: "auto",
};

const listStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
};

const emptyStyle: CSSProperties = {
  padding: 16,
  textAlign: "center",
  color: "var(--rei-color-text-muted)",
  fontSize: 13,
};

// =============================================================================
// Helper Functions
// =============================================================================

function getShapeIcon(type: ShapeType): ReactNode {
  switch (type) {
    case "ellipse":
      return <LuCircle size={14} />;
    case "diamond":
    case "hexagon":
    case "triangle":
    case "parallelogram":
    case "cylinder":
      return <LuSquare size={14} />;
    default:
      return <LuSquare size={14} />;
  }
}

function getNodeIcon(node: DiagramNode): ReactNode {
  if (node.type === "text") {
    return <LuType size={14} />;
  }
  if (node.type === "group") {
    return <LuLayers size={14} />;
  }
  if (isFrameNode(node)) {
    return <LuFrame size={14} />;
  }
  if (isSymbolInstance(node)) {
    return <LuComponent size={14} />;
  }
  return getShapeIcon(node.type);
}

function getNodeLabel(node: DiagramNode): string {
  if (node.type === "text") {
    const content = (node as { content: string }).content;
    return content.length > 20 ? `${content.slice(0, 20)}...` : content || "Text";
  }
  if (isFrameNode(node)) {
    return framePresets[node.preset].label;
  }
  if (isSymbolInstance(node)) {
    return `Instance (${node.variantId})`;
  }
  if (isGroupNode(node)) {
    return `Group (${node.id})`;
  }
  return node.type.charAt(0).toUpperCase() + node.type.slice(1).replace("-", " ");
}

function getPartIcon(part: SymbolPart): ReactNode {
  if (part.type === "text") {
    return <LuType size={14} />;
  }
  return getShapeIcon(part.shape);
}

// =============================================================================
// Component
// =============================================================================

export const LayersPanel = memo(function LayersPanel() {
  const pageCtx = useContext(PageContext);
  const selectionCtx = useContext(SelectionContext);

  if (!pageCtx || !selectionCtx) {
    return null;
  }

  const { activePageId, canvasPage, symbolsPage } = pageCtx;
  const { selectedNodeIds, setSelectedNodeIds, setSelectedConnectionIds } = selectionCtx;

  // Get canvas page nodes
  const canvasNodes = canvasPage.nodes;

  // Get top-level nodes (not children of any group or frame)
  const topLevelNodes = useMemo(() => {
    const childIds = new Set<string>();
    canvasNodes.forEach((node) => {
      if (isGroupNode(node) || isFrameNode(node)) {
        node.children.forEach((childId) => childIds.add(childId));
      }
    });
    return canvasNodes.filter((node) => !childIds.has(node.id));
  }, [canvasNodes]);

  // Get children of a group or frame
  const getChildren = useCallback(
    (parentId: string): DiagramNode[] => {
      const parent = canvasNodes.find((n) => n.id === parentId);
      if (!parent) return [];
      if (isGroupNode(parent) || isFrameNode(parent)) {
        return parent.children
          .map((childId) => canvasNodes.find((n) => n.id === childId))
          .filter((n): n is DiagramNode => n !== undefined);
      }
      return [];
    },
    [canvasNodes],
  );

  // Selection handler
  const handleSelect = useCallback(
    (nodeId: string, e: React.PointerEvent) => {
      if (e.shiftKey) {
        setSelectedNodeIds((prev) => {
          const next = new Set(prev);
          if (next.has(nodeId)) {
            next.delete(nodeId);
          } else {
            next.add(nodeId);
          }
          return next;
        });
      } else {
        setSelectedNodeIds(new Set([nodeId]));
        setSelectedConnectionIds(new Set());
      }
    },
    [setSelectedNodeIds, setSelectedConnectionIds],
  );

  // Render a node and its children recursively
  const renderNode = useCallback(
    (node: DiagramNode, depth: number = 0): ReactNode => {
      const isContainer = isGroupNode(node) || isFrameNode(node);
      const children = isContainer ? getChildren(node.id) : [];
      const hasChildren = children.length > 0;
      const isSelected = selectedNodeIds.has(node.id);

      return (
        <div key={node.id}>
          <LayerItem
            id={node.id}
            label={getNodeLabel(node)}
            icon={getNodeIcon(node)}
            depth={depth}
            selected={isSelected}
            hasChildren={hasChildren}
            expanded={hasChildren}
            onPointerDown={(e) => handleSelect(node.id, e)}
            showVisibilityToggle={false}
            showLockToggle={false}
          />
          {hasChildren &&
            children.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    },
    [getChildren, selectedNodeIds, handleSelect],
  );

  // Render symbol definition on Symbols page
  const renderSymbolLayers = useCallback(() => {
    const symbol = symbolsPage.symbol;
    if (!symbol) {
      return <div style={emptyStyle}>No symbol defined</div>;
    }

    const variantEntries = Object.entries(symbol.variants);

    return (
      <>
        {/* Symbol name */}
        <LayerItem
          id={symbol.id}
          label={symbol.name}
          icon={<LuComponent size={14} />}
          depth={0}
          selected={false}
          hasChildren
          expanded
          showVisibilityToggle={false}
          showLockToggle={false}
        />

        {/* Parts */}
        <LayerItem
          id="parts"
          label="Parts"
          icon={<LuLayers size={14} />}
          depth={1}
          selected={false}
          hasChildren
          expanded
          showVisibilityToggle={false}
          showLockToggle={false}
        />
        {symbol.parts.map((part) => (
          <LayerItem
            key={part.id}
            id={part.id}
            label={part.name}
            icon={getPartIcon(part)}
            depth={2}
            selected={false}
            hasChildren={false}
            showVisibilityToggle={false}
            showLockToggle={false}
          />
        ))}

        {/* Variants */}
        <LayerItem
          id="variants"
          label="Variants"
          icon={<LuPalette size={14} />}
          depth={1}
          selected={false}
          hasChildren
          expanded
          showVisibilityToggle={false}
          showLockToggle={false}
        />
        {variantEntries.map(([variantId, variant]) => (
          <LayerItem
            key={variantId}
            id={variantId}
            label={variant.name}
            icon={<LuComponent size={14} />}
            depth={2}
            selected={false}
            hasChildren={false}
            showVisibilityToggle={false}
            showLockToggle={false}
          />
        ))}
      </>
    );
  }, [symbolsPage.symbol]);

  return (
    <div style={containerStyle}>
      <SectionHeader
        title={`Layers (${activePageId === "canvas" ? "Canvas" : "Symbols"})`}
      />
      <div style={listStyle}>
        {activePageId === "canvas" ? (
          topLevelNodes.length === 0 ? (
            <div style={emptyStyle}>No elements on this page</div>
          ) : (
            topLevelNodes.map((node) => renderNode(node))
          )
        ) : (
          renderSymbolLayers()
        )}
      </div>
    </div>
  );
});
