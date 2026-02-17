/**
 * @file DiagramInspector - Right panel for editing selected element properties
 */

import { memo, useCallback, useContext, useMemo, useState, type CSSProperties } from "react";
import { LuTrash2 } from "react-icons/lu";

import { PropertySection } from "../../../../../components/PropertySection/PropertySection";
import { PropertyRow } from "../../../../../components/PropertyRow/PropertyRow";
import { Input } from "../../../../../components/Input/Input";
import { UnitInput } from "../../../../../components/UnitInput/UnitInput";
import { ColorInput } from "../../../../../components/ColorInput/ColorInput";
import { Select, type SelectOption } from "../../../../../components/Select/Select";
import { IconButton } from "../../../../../components/IconButton/IconButton";
import { TabBar } from "../../../../../components/TabBar/TabBar";
import { Checkbox } from "../../../../../components/Checkbox/Checkbox";
import type { ColorValue } from "../../../../../utils/color/types";

import { PositionSection } from "../../../../../sections/PositionSection/PositionSection";
import { SizeSection } from "../../../../../sections/SizeSection/SizeSection";
import { RotationSection } from "../../../../../sections/RotationSection/RotationSection";
import type { PositionData } from "../../../../../sections/PositionSection/types";
import type { SizeData } from "../../../../../sections/SizeSection/types";
import type { RotationData } from "../../../../../sections/RotationSection/types";
import { StrokeStyleSelect } from "../../../../../sections/StrokeSection/parts/StrokeStyleSelect";
import type { StrokeStyle as SectionStrokeStyle } from "../../../../../sections/StrokeSection/types";

import { DocumentContext, SelectionContext, PageContext } from "../contexts";
import type { StrokeStyle, ArrowheadType, DiagramNode, ShapeNode, TextNode, FrameNode, FramePreset, ShapeType, Connection } from "../types";
import { isFrameNode } from "../types";
import { framePresets, type FramePresetInfo } from "../mockData";
import { ThemeEditor } from "./ThemeEditor";

// =============================================================================
// Type Guards
// =============================================================================

function isShapeNode(node: DiagramNode): node is ShapeNode {
  return node.type !== "text" && node.type !== "group" && node.type !== "instance" && node.type !== "frame";
}

function isTextNode(node: DiagramNode): node is TextNode {
  return node.type === "text";
}

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--rei-color-surface)",
  borderLeft: "1px solid var(--rei-color-border)",
  overflow: "auto",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 16px",
  borderBottom: "1px solid var(--rei-color-border)",
};

const titleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--rei-color-text)",
};

const emptyStateStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  textAlign: "center",
  color: "var(--rei-color-text-muted)",
  fontSize: 13,
};

const tabBarContainerStyle: CSSProperties = {
  padding: "8px 16px",
  borderBottom: "1px solid var(--rei-color-border)",
};

const contentStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
};

type InspectorTab = "design" | "theme";

// =============================================================================
// Options
// =============================================================================

const strokeStyleOptions: SelectOption<StrokeStyle>[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const arrowheadOptions: SelectOption<ArrowheadType>[] = [
  { value: "none", label: "None" },
  { value: "arrow", label: "Arrow" },
  { value: "triangle", label: "Triangle" },
  { value: "diamond", label: "Diamond" },
  { value: "circle", label: "Circle" },
];

const shapeTypeOptions: SelectOption<ShapeType>[] = [
  { value: "rectangle", label: "Rectangle" },
  { value: "rounded-rect", label: "Rounded Rectangle" },
  { value: "ellipse", label: "Ellipse" },
  { value: "diamond", label: "Diamond" },
  { value: "triangle", label: "Triangle" },
  { value: "hexagon", label: "Hexagon" },
  { value: "parallelogram", label: "Parallelogram" },
  { value: "cylinder", label: "Cylinder" },
];

const pixelUnits = [{ value: "px", label: "px" }];
const degreeUnits = [{ value: "°", label: "°" }];

// Frame preset options
const framePresetOptions: SelectOption<FramePreset>[] = (Object.entries(framePresets) as [FramePreset, FramePresetInfo][]).map(
  ([value, info]) => ({
    value,
    label: `${info.label} (${info.width} × ${info.height})`,
  }),
);

// =============================================================================
// Component
// =============================================================================

const inspectorTabs = [
  { id: "design" as const, label: "Design" },
  { id: "theme" as const, label: "Theme" },
];

export const DiagramInspector = memo(function DiagramInspector() {
  const documentCtx = useContext(DocumentContext);
  const selectionCtx = useContext(SelectionContext);
  const pageCtx = useContext(PageContext);
  const [activeTab, setActiveTab] = useState<InspectorTab>("design");

  if (!documentCtx || !selectionCtx || !pageCtx) {
    return null;
  }

  const { document, setDocument } = documentCtx;
  const { selectedNodeIds, selectedConnectionIds, setSelectedNodeIds, setSelectedConnectionIds } = selectionCtx;
  const { activePageId, canvasPage } = pageCtx;

  // Use canvas page nodes and connections (only canvas page has these)
  const pageNodes = canvasPage.nodes;
  const pageConnections = canvasPage.connections;

  // Helper to update canvas page's nodes
  const updatePageNodes = (updater: (nodes: DiagramNode[]) => DiagramNode[]) => {
    if (activePageId !== "canvas") return; // Only update on canvas page
    setDocument((prev) => ({
      ...prev,
      canvasPage: {
        ...prev.canvasPage,
        nodes: updater(prev.canvasPage.nodes),
      },
    }));
  };

  // Helper to update canvas page's connections
  const updatePageConnections = (updater: (connections: Connection[]) => Connection[]) => {
    if (activePageId !== "canvas") return; // Only update on canvas page
    setDocument((prev) => ({
      ...prev,
      canvasPage: {
        ...prev.canvasPage,
        connections: updater(prev.canvasPage.connections),
      },
    }));
  };

  // Helper to update both nodes and connections
  const updatePageNodesAndConnections = (
    nodeUpdater: (nodes: DiagramNode[]) => DiagramNode[],
    connUpdater: (connections: Connection[]) => Connection[],
  ) => {
    if (activePageId !== "canvas") return; // Only update on canvas page
    setDocument((prev) => ({
      ...prev,
      canvasPage: {
        ...prev.canvasPage,
        nodes: nodeUpdater(prev.canvasPage.nodes),
        connections: connUpdater(prev.canvasPage.connections),
      },
    }));
  };

  // Get selected nodes (all of them for multi-selection)
  const selectedNodes = useMemo(() => {
    return pageNodes.filter((n: DiagramNode) => selectedNodeIds.has(n.id));
  }, [pageNodes, selectedNodeIds]);

  // Get single selected node (for showing specific values)
  const selectedNode = useMemo(() => {
    if (selectedNodeIds.size !== 1) return null;
    const nodeId = Array.from(selectedNodeIds)[0];
    return pageNodes.find((n: DiagramNode) => n.id === nodeId) ?? null;
  }, [pageNodes, selectedNodeIds]);

  // Check if multiple nodes selected
  const isMultiSelection = selectedNodeIds.size > 1;

  // Get selected connection
  const selectedConnection = useMemo(() => {
    if (selectedConnectionIds.size !== 1) return null;
    const connId = Array.from(selectedConnectionIds)[0];
    return pageConnections.find((c: Connection) => c.id === connId) ?? null;
  }, [pageConnections, selectedConnectionIds]);

  // Multi-selection property handlers (apply to all selected shape nodes)
  const multiNodeHandlers = useMemo(() => {
    if (selectedNodeIds.size === 0) return null;

    return {
      setType: (type: ShapeType) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            selectedNodeIds.has(n.id) && isShapeNode(n) ? { ...n, type } : n,
          ) as DiagramNode[],
        );
      },
      setFill: (fill: ColorValue) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            selectedNodeIds.has(n.id) && isShapeNode(n) ? { ...n, fill } : n,
          ),
        );
      },
      setStrokeColor: (color: ColorValue) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            selectedNodeIds.has(n.id) && isShapeNode(n)
              ? { ...n, stroke: { ...n.stroke, color } }
              : n,
          ),
        );
      },
      setStrokeWidth: (value: string) => {
        const width = Math.max(0, parseFloat(value) || 0);
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            selectedNodeIds.has(n.id) && isShapeNode(n)
              ? { ...n, stroke: { ...n.stroke, width } }
              : n,
          ),
        );
      },
      setStrokeStyle: (style: StrokeStyle) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            selectedNodeIds.has(n.id) && isShapeNode(n)
              ? { ...n, stroke: { ...n.stroke, style } }
              : n,
          ),
        );
      },
      delete: () => {
        updatePageNodesAndConnections(
          (nodes) => nodes.filter((n) => !selectedNodeIds.has(n.id)),
          (connections) =>
            connections.filter(
              (c: Connection) => !selectedNodeIds.has(c.source.nodeId) && !selectedNodeIds.has(c.target.nodeId),
            ),
        );
        setSelectedNodeIds(new Set());
      },
    };
  }, [selectedNodeIds, updatePageNodes, updatePageNodesAndConnections, setSelectedNodeIds]);

  // Node property handlers (single node) - handles ShapeNode, TextNode, GroupNode
  const nodeHandlers = useMemo(() => {
    if (!selectedNode) return null;
    const nodeId = selectedNode.id;

    return {
      // For TextNode content
      setContent: (value: string) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isTextNode(n) ? { ...n, content: value } : n,
          ),
        );
      },
      // For ShapeNode type
      setType: (type: ShapeType) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isShapeNode(n) ? { ...n, type } : n,
          ) as DiagramNode[],
        );
      },
      setX: (value: string) => {
        const x = parseFloat(value) || 0;
        updatePageNodes((nodes) =>
          nodes.map((n) => (n.id === nodeId ? { ...n, x } : n)),
        );
      },
      setY: (value: string) => {
        const y = parseFloat(value) || 0;
        updatePageNodes((nodes) =>
          nodes.map((n) => (n.id === nodeId ? { ...n, y } : n)),
        );
      },
      setWidth: (value: string) => {
        const width = Math.max(20, parseFloat(value) || 0);
        updatePageNodes((nodes) =>
          nodes.map((n) => (n.id === nodeId ? { ...n, width } : n)),
        );
      },
      setHeight: (value: string) => {
        const height = Math.max(20, parseFloat(value) || 0);
        updatePageNodes((nodes) =>
          nodes.map((n) => (n.id === nodeId ? { ...n, height } : n)),
        );
      },
      setRotation: (value: string) => {
        const rotation = parseFloat(value) || 0;
        updatePageNodes((nodes) =>
          nodes.map((n) => (n.id === nodeId ? { ...n, rotation } : n)),
        );
      },
      // For ShapeNode fill
      setFill: (fill: ColorValue) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isShapeNode(n) ? { ...n, fill } : n,
          ),
        );
      },
      // For ShapeNode stroke
      setStrokeColor: (color: ColorValue) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isShapeNode(n)
              ? { ...n, stroke: { ...n.stroke, color } }
              : n,
          ),
        );
      },
      setStrokeWidth: (value: string) => {
        const width = Math.max(0, parseFloat(value) || 0);
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isShapeNode(n)
              ? { ...n, stroke: { ...n.stroke, width } }
              : n,
          ),
        );
      },
      setStrokeStyle: (style: StrokeStyle) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isShapeNode(n)
              ? { ...n, stroke: { ...n.stroke, style } }
              : n,
          ),
        );
      },
      // For TextNode color
      setTextColor: (color: ColorValue) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isTextNode(n)
              ? { ...n, textProps: { ...n.textProps, color } }
              : n,
          ),
        );
      },
      // For FrameNode preset
      setFramePreset: (preset: FramePreset) => {
        const presetInfo = framePresets[preset];
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isFrameNode(n)
              ? { ...n, preset, width: presetInfo.width, height: presetInfo.height }
              : n,
          ),
        );
      },
      // For FrameNode fill
      setFrameFill: (fill: ColorValue) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isFrameNode(n) ? { ...n, fill } : n,
          ),
        );
      },
      // For FrameNode stroke
      setFrameStrokeColor: (color: ColorValue) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isFrameNode(n)
              ? { ...n, stroke: { ...n.stroke, color } }
              : n,
          ),
        );
      },
      setFrameStrokeWidth: (value: string) => {
        const width = Math.max(0, parseFloat(value) || 0);
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isFrameNode(n)
              ? { ...n, stroke: { ...n.stroke, width } }
              : n,
          ),
        );
      },
      setFrameStrokeStyle: (style: StrokeStyle) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isFrameNode(n)
              ? { ...n, stroke: { ...n.stroke, style } }
              : n,
          ),
        );
      },
      // For FrameNode options
      setClipContent: (checked: boolean) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isFrameNode(n) ? { ...n, clipContent: checked } : n,
          ),
        );
      },
      setShowBackground: (checked: boolean) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isFrameNode(n) ? { ...n, showBackground: checked } : n,
          ),
        );
      },
      delete: () => {
        updatePageNodesAndConnections(
          (nodes) => nodes.filter((n) => n.id !== nodeId),
          (connections) =>
            connections.filter(
              (c: Connection) => c.source.nodeId !== nodeId && c.target.nodeId !== nodeId,
            ),
        );
        setSelectedNodeIds(new Set());
      },
    };
  }, [selectedNode, updatePageNodes, updatePageNodesAndConnections, setSelectedNodeIds]);

  // Section data for PositionSection/SizeSection/RotationSection
  const positionData: PositionData = useMemo(
    () => ({
      x: selectedNode ? String(Math.round(selectedNode.x)) : "0",
      y: selectedNode ? String(Math.round(selectedNode.y)) : "0",
    }),
    [selectedNode],
  );

  const sizeData: SizeData = useMemo(
    () => ({
      width: selectedNode ? String(Math.round(selectedNode.width)) : "0",
      height: selectedNode ? String(Math.round(selectedNode.height)) : "0",
    }),
    [selectedNode],
  );

  const rotationData: RotationData = useMemo(
    () => ({
      rotation: selectedNode ? String(Math.round(selectedNode.rotation)) : "0",
    }),
    [selectedNode],
  );

  // Section handlers
  const handlePositionChange = useCallback(
    (data: PositionData) => {
      if (!selectedNode) return;
      const nodeId = selectedNode.id;
      const x = parseFloat(data.x) || 0;
      const y = parseFloat(data.y) || 0;
      updatePageNodes((nodes) =>
        nodes.map((n) => (n.id === nodeId ? { ...n, x, y } : n)),
      );
    },
    [selectedNode, updatePageNodes],
  );

  const handleSizeChange = useCallback(
    (data: SizeData) => {
      if (!selectedNode) return;
      const nodeId = selectedNode.id;
      const width = Math.max(20, parseFloat(data.width) || 0);
      const height = Math.max(20, parseFloat(data.height) || 0);
      updatePageNodes((nodes) =>
        nodes.map((n) => (n.id === nodeId ? { ...n, width, height } : n)),
      );
    },
    [selectedNode, updatePageNodes],
  );

  const handleRotationChange = useCallback(
    (data: RotationData) => {
      if (!selectedNode) return;
      const nodeId = selectedNode.id;
      const rotation = parseFloat(data.rotation) || 0;
      updatePageNodes((nodes) =>
        nodes.map((n) => (n.id === nodeId ? { ...n, rotation } : n)),
      );
    },
    [selectedNode, updatePageNodes],
  );

  // Connection property handlers
  const connectionHandlers = useMemo(() => {
    if (!selectedConnection) return null;
    const connId = selectedConnection.id;

    return {
      setLabel: (value: string) => {
        updatePageConnections((connections) =>
          connections.map((c: Connection) => (c.id === connId ? { ...c, label: value } : c)),
        );
      },
      setStrokeColor: (color: ColorValue) => {
        updatePageConnections((connections) =>
          connections.map((c: Connection) =>
            c.id === connId ? { ...c, stroke: { ...c.stroke, color } } : c,
          ),
        );
      },
      setStrokeWidth: (value: string) => {
        const width = Math.max(0, parseFloat(value) || 0);
        updatePageConnections((connections) =>
          connections.map((c: Connection) =>
            c.id === connId ? { ...c, stroke: { ...c.stroke, width } } : c,
          ),
        );
      },
      setStrokeStyle: (style: StrokeStyle) => {
        updatePageConnections((connections) =>
          connections.map((c: Connection) =>
            c.id === connId ? { ...c, stroke: { ...c.stroke, style } } : c,
          ),
        );
      },
      setStartArrow: (arrow: ArrowheadType) => {
        updatePageConnections((connections) =>
          connections.map((c: Connection) =>
            c.id === connId ? { ...c, startArrow: arrow } : c,
          ),
        );
      },
      setEndArrow: (arrow: ArrowheadType) => {
        updatePageConnections((connections) =>
          connections.map((c: Connection) =>
            c.id === connId ? { ...c, endArrow: arrow } : c,
          ),
        );
      },
      delete: () => {
        updatePageConnections((connections) =>
          connections.filter((c: Connection) => c.id !== connId),
        );
        setSelectedConnectionIds(new Set());
      },
    };
  }, [selectedConnection, updatePageConnections, setSelectedConnectionIds]);

  // Filter selected nodes by type
  const selectedShapeNodes = useMemo(
    () => selectedNodes.filter(isShapeNode),
    [selectedNodes],
  );

  // Get common value for multi-selection of shape nodes
  const getCommonShapeValue = <T,>(getter: (node: ShapeNode) => T): T | undefined => {
    if (selectedShapeNodes.length === 0) return undefined;
    const firstValue = getter(selectedShapeNodes[0]);
    const allSame = selectedShapeNodes.every((n) => getter(n) === firstValue);
    return allSame ? firstValue : undefined;
  };

  // Render content based on active tab
  const renderDesignContent = () => {
    // Multi-selection inspector (only for shape nodes)
    if (isMultiSelection && multiNodeHandlers && selectedShapeNodes.length > 0) {
      const commonType = getCommonShapeValue((n) => n.type);
      const commonStrokeWidth = getCommonShapeValue((n) => n.stroke.width);
      const commonStrokeStyle = getCommonShapeValue((n) => n.stroke.style);
      const firstShape = selectedShapeNodes[0];

      return (
        <div style={contentStyle}>
          <div style={headerStyle}>
            <span style={titleStyle}>{selectedShapeNodes.length} Shapes Selected</span>
            <IconButton
              icon={<LuTrash2 size={16} />}
              aria-label="Delete shapes"
              size="sm"
              variant="ghost"
              onClick={multiNodeHandlers.delete}
            />
          </div>

          <PropertySection title="Type">
            <Select
              options={shapeTypeOptions}
              value={commonType ?? "rectangle"}
              onChange={multiNodeHandlers.setType}
              size="sm"
              placeholder={commonType ? undefined : "Mixed"}
            />
          </PropertySection>

          <PropertySection title="Fill">
            <ColorInput
              value={firstShape.fill}
              onChange={multiNodeHandlers.setFill}
              size="sm"
              showVisibilityToggle
            />
          </PropertySection>

          <PropertySection title="Stroke">
            <ColorInput
              value={firstShape.stroke.color}
              onChange={multiNodeHandlers.setStrokeColor}
              size="sm"
              showVisibilityToggle
            />
            <PropertyRow label="Width">
              <UnitInput
                value={commonStrokeWidth !== undefined ? String(commonStrokeWidth) : ""}
                onChange={multiNodeHandlers.setStrokeWidth}
                units={pixelUnits}
                size="sm"
                placeholder={commonStrokeWidth !== undefined ? undefined : "Mixed"}
              />
            </PropertyRow>
            <PropertyRow label="Style">
              <Select
                options={strokeStyleOptions}
                value={commonStrokeStyle ?? "solid"}
                onChange={multiNodeHandlers.setStrokeStyle}
                size="sm"
                placeholder={commonStrokeStyle ? undefined : "Mixed"}
              />
            </PropertyRow>
          </PropertySection>
        </div>
      );
    }

    // Single node inspector - handle different node types
    if (selectedNode && nodeHandlers) {
      const nodeTitle = isShapeNode(selectedNode)
        ? "Shape Properties"
        : isTextNode(selectedNode)
          ? "Text Properties"
          : isFrameNode(selectedNode)
            ? "Frame Properties"
            : "Group Properties";

      return (
        <div style={contentStyle}>
          <div style={headerStyle}>
            <span style={titleStyle}>{nodeTitle}</span>
            <IconButton
              icon={<LuTrash2 size={16} />}
              aria-label="Delete element"
              size="sm"
              variant="ghost"
              onClick={nodeHandlers.delete}
            />
          </div>

          {/* Shape Type (only for shapes) */}
          {isShapeNode(selectedNode) && (
            <PropertySection title="Type">
              <Select
                options={shapeTypeOptions}
                value={selectedNode.type}
                onChange={nodeHandlers.setType}
                size="sm"
              />
            </PropertySection>
          )}

          {/* Text Content (only for text nodes) */}
          {isTextNode(selectedNode) && (
            <PropertySection title="Content">
              <Input
                value={selectedNode.content}
                onChange={nodeHandlers.setContent}
                placeholder="Enter text..."
                size="sm"
              />
            </PropertySection>
          )}

          {/* Frame Preset (only for frames) */}
          {isFrameNode(selectedNode) && (
            <PropertySection title="Preset">
              <Select
                options={framePresetOptions}
                value={selectedNode.preset}
                onChange={nodeHandlers.setFramePreset}
                size="sm"
              />
            </PropertySection>
          )}

          <PositionSection
            data={positionData}
            onChange={handlePositionChange}
          />

          <SizeSection
            data={sizeData}
            onChange={handleSizeChange}
          />

          <RotationSection
            data={rotationData}
            onChange={handleRotationChange}
            showTransformButtons={false}
          />

          {/* Fill & Stroke (only for shapes) */}
          {isShapeNode(selectedNode) && (
            <>
              <PropertySection title="Fill">
                <ColorInput
                  value={selectedNode.fill}
                  onChange={nodeHandlers.setFill}
                  size="sm"
                  showVisibilityToggle
                />
              </PropertySection>

              <PropertySection title="Stroke">
                <ColorInput
                  value={selectedNode.stroke.color}
                  onChange={nodeHandlers.setStrokeColor}
                  size="sm"
                  showVisibilityToggle
                />
                <PropertyRow label="Width">
                  <UnitInput
                    value={String(selectedNode.stroke.width)}
                    onChange={nodeHandlers.setStrokeWidth}
                    units={pixelUnits}
                    size="sm"
                  />
                </PropertyRow>
                <PropertyRow label="Style">
                  <StrokeStyleSelect
                    value={selectedNode.stroke.style as SectionStrokeStyle}
                    onChange={nodeHandlers.setStrokeStyle as (v: SectionStrokeStyle) => void}
                    size="sm"
                  />
                </PropertyRow>
              </PropertySection>
            </>
          )}

          {/* Text Color (only for text nodes) */}
          {isTextNode(selectedNode) && (
            <PropertySection title="Text Color">
              <ColorInput
                value={selectedNode.textProps.color}
                onChange={nodeHandlers.setTextColor}
                size="sm"
                showVisibilityToggle
              />
            </PropertySection>
          )}

          {/* Frame Fill & Stroke */}
          {isFrameNode(selectedNode) && (
            <>
              <PropertySection title="Fill">
                <ColorInput
                  value={selectedNode.fill}
                  onChange={nodeHandlers.setFrameFill}
                  size="sm"
                  showVisibilityToggle
                />
              </PropertySection>

              <PropertySection title="Stroke">
                <ColorInput
                  value={selectedNode.stroke.color}
                  onChange={nodeHandlers.setFrameStrokeColor}
                  size="sm"
                  showVisibilityToggle
                />
                <PropertyRow label="Width">
                  <UnitInput
                    value={String(selectedNode.stroke.width)}
                    onChange={nodeHandlers.setFrameStrokeWidth}
                    units={pixelUnits}
                    size="sm"
                  />
                </PropertyRow>
                <PropertyRow label="Style">
                  <StrokeStyleSelect
                    value={selectedNode.stroke.style as SectionStrokeStyle}
                    onChange={nodeHandlers.setFrameStrokeStyle as (v: SectionStrokeStyle) => void}
                    size="sm"
                  />
                </PropertyRow>
              </PropertySection>

              <PropertySection title="Options">
                <PropertyRow label="Clip Content">
                  <Checkbox
                    checked={selectedNode.clipContent}
                    onChange={nodeHandlers.setClipContent}
                    size="sm"
                  />
                </PropertyRow>
                <PropertyRow label="Show Background">
                  <Checkbox
                    checked={selectedNode.showBackground}
                    onChange={nodeHandlers.setShowBackground}
                    size="sm"
                  />
                </PropertyRow>
              </PropertySection>
            </>
          )}
        </div>
      );
    }

    // Connection inspector
    if (selectedConnection && connectionHandlers) {
      return (
        <div style={contentStyle}>
          <div style={headerStyle}>
            <span style={titleStyle}>Connection Properties</span>
            <IconButton
              icon={<LuTrash2 size={16} />}
              aria-label="Delete connection"
              size="sm"
              variant="ghost"
              onClick={connectionHandlers.delete}
            />
          </div>

          <PropertySection title="Label">
            <Input
              value={selectedConnection.label}
              onChange={connectionHandlers.setLabel}
              placeholder="Enter label..."
              size="sm"
            />
          </PropertySection>

          <PropertySection title="Stroke">
            <ColorInput
              value={selectedConnection.stroke.color}
              onChange={connectionHandlers.setStrokeColor}
              size="sm"
              showVisibilityToggle
            />
            <PropertyRow label="Width">
              <UnitInput
                value={String(selectedConnection.stroke.width)}
                onChange={connectionHandlers.setStrokeWidth}
                units={pixelUnits}
                size="sm"
              />
            </PropertyRow>
            <PropertyRow label="Style">
              <StrokeStyleSelect
                value={selectedConnection.stroke.style as SectionStrokeStyle}
                onChange={connectionHandlers.setStrokeStyle as (v: SectionStrokeStyle) => void}
                size="sm"
              />
            </PropertyRow>
          </PropertySection>

          <PropertySection title="Arrows">
            <PropertyRow label="Start">
              <Select
                options={arrowheadOptions}
                value={selectedConnection.startArrow}
                onChange={connectionHandlers.setStartArrow}
                size="sm"
              />
            </PropertyRow>
            <PropertyRow label="End">
              <Select
                options={arrowheadOptions}
                value={selectedConnection.endArrow}
                onChange={connectionHandlers.setEndArrow}
                size="sm"
              />
            </PropertyRow>
          </PropertySection>
        </div>
      );
    }

    // Empty state
    return (
      <div style={emptyStateStyle}>
        Select a shape or connection to view its properties
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={tabBarContainerStyle}>
        <TabBar
          tabs={inspectorTabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as InspectorTab)}
          size="sm"
        />
      </div>
      {activeTab === "design" ? renderDesignContent() : <ThemeEditor />}
    </div>
  );
});
