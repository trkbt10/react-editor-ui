/**
 * @file FloatingShapeToolbar - Bottom floating toolbar for quick shape addition
 */

import { memo, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import {
  LuSquare,
  LuCircle,
  LuDiamond,
  LuDatabase,
  LuTriangle,
  LuHexagon,
  LuType,
} from "react-icons/lu";

import { Toolbar } from "../../../../../components/Toolbar/Toolbar";
import { ToolbarGroup } from "../../../../../components/Toolbar/ToolbarGroup";
import { ToolbarDivider } from "../../../../../components/Toolbar/ToolbarDivider";
import { IconButton } from "../../../../../components/IconButton/IconButton";
import { Tooltip } from "../../../../../components/Tooltip/Tooltip";

import { DocumentContext, SelectionContext, PageContext } from "../contexts";
import { createNode } from "../mockData";
import type { NodeType, DiagramNode } from "../types";

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  position: "absolute",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 100,
};

// =============================================================================
// Shape Definitions
// =============================================================================

type ShapeButton = {
  type: NodeType;
  label: string;
  icon: ReactNode;
};

const shapeButtons: ShapeButton[] = [
  { type: "rectangle", label: "Rectangle", icon: <LuSquare size={18} /> },
  { type: "rounded-rect", label: "Rounded Rectangle", icon: <LuSquare size={18} style={{ borderRadius: 4 }} /> },
  { type: "ellipse", label: "Ellipse", icon: <LuCircle size={18} /> },
  { type: "diamond", label: "Diamond", icon: <LuDiamond size={18} /> },
  { type: "triangle", label: "Triangle", icon: <LuTriangle size={18} /> },
  { type: "hexagon", label: "Hexagon", icon: <LuHexagon size={18} /> },
  { type: "cylinder", label: "Database", icon: <LuDatabase size={18} /> },
  { type: "text", label: "Text", icon: <LuType size={18} /> },
];

// =============================================================================
// Component
// =============================================================================

export const FloatingShapeToolbar = memo(function FloatingShapeToolbar() {
  const documentCtx = useContext(DocumentContext);
  const selectionCtx = useContext(SelectionContext);
  const pageCtx = useContext(PageContext);

  const handlers = useMemo(() => {
    if (!documentCtx || !selectionCtx || !pageCtx) return {};

    const { setDocument } = documentCtx;
    const { setSelectedNodeIds, setSelectedConnectionIds } = selectionCtx;
    const { activePageId } = pageCtx;

    // Only allow adding shapes on canvas page
    if (activePageId !== "canvas") return {};

    // Helper to update canvas page's nodes
    const updateCanvasNodes = (updater: (nodes: DiagramNode[]) => DiagramNode[]) => {
      setDocument((prev) => ({
        ...prev,
        canvasPage: {
          ...prev.canvasPage,
          nodes: updater(prev.canvasPage.nodes),
        },
      }));
    };

    return Object.fromEntries(
      shapeButtons.map((shape) => [
        shape.type,
        () => {
          // Add node at center of canvas (will be positioned better in actual usage)
          const newNode = createNode(shape.type, 200, 200, 120, 80);

          updateCanvasNodes((nodes) => [...nodes, newNode]);

          // Select the new node
          setSelectedNodeIds(new Set([newNode.id]));
          setSelectedConnectionIds(new Set());
        },
      ]),
    );
  }, [documentCtx, selectionCtx, pageCtx]);

  if (!documentCtx || !selectionCtx || !pageCtx) {
    return null;
  }

  return (
    <div style={containerStyle}>
      <Toolbar variant="floating" orientation="horizontal" fitContent>
        <ToolbarGroup>
          {shapeButtons.slice(0, 4).map((shape) => (
            <Tooltip key={shape.type} content={shape.label} placement="top">
              <IconButton
                icon={shape.icon}
                aria-label={`Add ${shape.label}`}
                size="lg"
                variant="minimal"
                onClick={handlers[shape.type]}
              />
            </Tooltip>
          ))}
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          {shapeButtons.slice(4).map((shape) => (
            <Tooltip key={shape.type} content={shape.label} placement="top">
              <IconButton
                icon={shape.icon}
                aria-label={`Add ${shape.label}`}
                size="lg"
                variant="minimal"
                onClick={handlers[shape.type]}
              />
            </Tooltip>
          ))}
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
});
