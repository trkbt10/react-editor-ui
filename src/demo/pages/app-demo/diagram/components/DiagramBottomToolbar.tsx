/**
 * @file DiagramBottomToolbar - Unified bottom toolbar with diagram controls
 */

import { memo, useContext, useMemo, useCallback, useState, type CSSProperties } from "react";
import {
  LuSquare,
  LuCircle,
  LuDiamond,
  LuDatabase,
  LuTriangle,
  LuHexagon,
  LuType,
  LuMousePointer2,
  LuSpline,
  LuGrid3X3,
  LuMagnet,
  LuLayoutDashboard,
  LuComponent,
} from "react-icons/lu";

import { Toolbar } from "../../../../../components/Toolbar/Toolbar";
import { ToolbarGroup } from "../../../../../components/Toolbar/ToolbarGroup";
import { ToolbarDivider } from "../../../../../components/Toolbar/ToolbarDivider";
import { IconButton } from "../../../../../components/IconButton/IconButton";
import { Tooltip } from "../../../../../components/Tooltip/Tooltip";
import { SplitButton, type SplitButtonOption } from "../../../../../components/SplitButton/SplitButton";
import { SegmentedControl, type SegmentedControlOption } from "../../../../../components/SegmentedControl/SegmentedControl";

import { DocumentContext, SelectionContext, PageContext, ToolContext, GridContext } from "../contexts";
import { createNode, createFrameNode } from "../mockData";
import type { NodeType, DiagramNode, PageId, FramePreset } from "../types";
import { FramePresetPicker } from "./FramePresetPicker";

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

type ShapeOption = SplitButtonOption<NodeType> & {
  width: number;
  height: number;
};

const shapeOptions: ShapeOption[] = [
  { value: "rectangle", label: "Rectangle", icon: <LuSquare size={16} />, shortcut: "R", width: 120, height: 80 },
  { value: "rounded-rect", label: "Rounded Rectangle", icon: <LuSquare size={16} style={{ borderRadius: 4 }} />, width: 120, height: 80 },
  { value: "ellipse", label: "Ellipse", icon: <LuCircle size={16} />, shortcut: "O", width: 100, height: 80 },
  { value: "diamond", label: "Diamond", icon: <LuDiamond size={16} />, width: 100, height: 100 },
  { value: "triangle", label: "Triangle", icon: <LuTriangle size={16} />, width: 100, height: 80 },
  { value: "hexagon", label: "Hexagon", icon: <LuHexagon size={16} />, width: 100, height: 80 },
  { value: "cylinder", label: "Database", icon: <LuDatabase size={16} />, width: 80, height: 100 },
  { value: "text", label: "Text", icon: <LuType size={16} />, shortcut: "T", width: 120, height: 40 },
];

// =============================================================================
// Page Options
// =============================================================================

const pageOptions: SegmentedControlOption<PageId>[] = [
  { value: "canvas", icon: <LuLayoutDashboard size={16} />, "aria-label": "Canvas" },
  { value: "symbols", icon: <LuComponent size={16} />, "aria-label": "Symbols" },
];

// =============================================================================
// Component
// =============================================================================

export const DiagramBottomToolbar = memo(function DiagramBottomToolbar() {
  const documentCtx = useContext(DocumentContext);
  const selectionCtx = useContext(SelectionContext);
  const pageCtx = useContext(PageContext);
  const toolCtx = useContext(ToolContext);
  const gridCtx = useContext(GridContext);

  const [selectedShape, setSelectedShape] = useState<NodeType>("rectangle");

  // Helper to update canvas page's nodes
  const updateCanvasNodes = useCallback(
    (updater: (nodes: DiagramNode[]) => DiagramNode[]) => {
      if (!documentCtx) return;
      documentCtx.setDocument((prev) => ({
        ...prev,
        canvasPage: {
          ...prev.canvasPage,
          nodes: updater(prev.canvasPage.nodes),
        },
      }));
    },
    [documentCtx],
  );

  // Add shape handler
  const handleAddShape = useCallback(() => {
    if (!documentCtx || !selectionCtx || !pageCtx) return;

    const { activePageId } = pageCtx;
    if (activePageId !== "canvas") return;

    const shapeConfig = shapeOptions.find((s) => s.value === selectedShape);
    if (!shapeConfig) return;

    const newNode = createNode(selectedShape, 200, 200, shapeConfig.width, shapeConfig.height);
    updateCanvasNodes((nodes) => [...nodes, newNode]);

    selectionCtx.setSelectedNodeIds(new Set([newNode.id]));
    selectionCtx.setSelectedConnectionIds(new Set());
  }, [documentCtx, selectionCtx, pageCtx, selectedShape, updateCanvasNodes]);

  // Page change handler
  const handlePageChange = useCallback((value: PageId | PageId[]) => {
    if (!pageCtx) return;
    const pageId = Array.isArray(value) ? value[0] : value;
    if (pageId) {
      pageCtx.setActivePageId(pageId);
    }
  }, [pageCtx]);

  // Tool handlers
  const toolHandlers = useMemo(() => {
    if (!toolCtx) return {};
    return {
      select: () => toolCtx.setActiveTool("select"),
      connection: () => toolCtx.setActiveTool("connection"),
    };
  }, [toolCtx]);

  // Frame handler
  const handleAddFrame = useCallback((preset: FramePreset) => {
    if (!documentCtx || !selectionCtx || !pageCtx) return;

    const newFrame = createFrameNode(preset, 100, 100);
    updateCanvasNodes((nodes) => [...nodes, newFrame]);

    selectionCtx.setSelectedNodeIds(new Set([newFrame.id]));
    selectionCtx.setSelectedConnectionIds(new Set());

    if (pageCtx.activePageId !== "canvas") {
      pageCtx.setActivePageId("canvas");
    }
  }, [documentCtx, selectionCtx, pageCtx, updateCanvasNodes]);

  if (!documentCtx || !selectionCtx || !pageCtx || !toolCtx || !gridCtx) {
    return null;
  }

  const { activeTool } = toolCtx;
  const { gridEnabled, snapToGrid, toggleGrid, toggleSnap } = gridCtx;
  const { activePageId } = pageCtx;

  return (
    <div style={containerStyle}>
      <Toolbar variant="floating" orientation="horizontal" fitContent>
        {/* Tool Selection */}
        <ToolbarGroup>
          <Tooltip content="Select (V)" placement="top">
            <IconButton
              icon={<LuMousePointer2 size={18} />}
              aria-label="Select tool"
              size="lg"
              variant={activeTool === "select" ? "selected" : "minimal"}
              onClick={toolHandlers.select}
            />
          </Tooltip>
          <Tooltip content="Connection (C)" placement="top">
            <IconButton
              icon={<LuSpline size={18} />}
              aria-label="Connection tool"
              size="lg"
              variant={activeTool === "connection" ? "selected" : "minimal"}
              onClick={toolHandlers.connection}
            />
          </Tooltip>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Shape SplitButton + Frame */}
        <ToolbarGroup>
          <Tooltip content="Add Shape" placement="top">
            <SplitButton
              options={shapeOptions}
              value={selectedShape}
              onChange={setSelectedShape}
              onAction={handleAddShape}
              size="lg"
              aria-label="Add shape"
            />
          </Tooltip>
          <FramePresetPicker onSelect={handleAddFrame} />
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Grid/Snap */}
        <ToolbarGroup>
          <Tooltip content={gridEnabled ? "Hide Grid" : "Show Grid"} placement="top">
            <IconButton
              icon={<LuGrid3X3 size={18} />}
              aria-label="Toggle grid"
              size="lg"
              variant={gridEnabled ? "selected" : "minimal"}
              onClick={toggleGrid}
            />
          </Tooltip>
          <Tooltip content={snapToGrid ? "Disable Snap" : "Enable Snap"} placement="top">
            <IconButton
              icon={<LuMagnet size={18} />}
              aria-label="Toggle snap to grid"
              size="lg"
              variant={snapToGrid ? "selected" : "minimal"}
              onClick={toggleSnap}
            />
          </Tooltip>
        </ToolbarGroup>

        <ToolbarDivider />

        {/* Page Switcher */}
        <ToolbarGroup>
          <SegmentedControl
            options={pageOptions}
            value={activePageId}
            onChange={handlePageChange}
            size="lg"
            variant="icon"
          />
        </ToolbarGroup>
      </Toolbar>
    </div>
  );
});
