/**
 * @file DiagramInspector - Right panel for editing selected element properties
 */

import { memo, useCallback, useContext, useMemo, useState, type CSSProperties } from "react";
import { LuTrash2, LuZoomIn, LuZoomOut, LuPlus, LuMinus } from "react-icons/lu";

import { PropertySection } from "../../../../../components/PropertySection/PropertySection";
import { PropertyRow } from "../../../../../components/PropertyRow/PropertyRow";
import { Input } from "../../../../../components/Input/Input";
import { UnitInput } from "../../../../../components/UnitInput/UnitInput";
import { ColorInput } from "../../../../../components/ColorInput/ColorInput";
import { Select, type SelectOption } from "../../../../../components/Select/Select";
import { IconButton } from "../../../../../components/IconButton/IconButton";
import { TabBar } from "../../../../../components/TabBar/TabBar";
import { Checkbox } from "../../../../../components/Checkbox/Checkbox";
import { Tooltip } from "../../../../../components/Tooltip/Tooltip";
import { SectionHeader } from "../../../../../components/SectionHeader/SectionHeader";
import { ArrowheadSelect, type ArrowheadType as ArrowheadSelectType } from "../../../../../components/ArrowheadSelect/ArrowheadSelect";
import type { ColorValue } from "../../../../../utils/color/types";

import { PositionSection } from "../../../../../sections/PositionSection/PositionSection";
import { SizeSection } from "../../../../../sections/SizeSection/SizeSection";
import { RotationSection } from "../../../../../sections/RotationSection/RotationSection";
import { ExportSection, type ExportSectionData } from "../../../../../sections/ExportSection/ExportSection";
import { StrokeSection } from "../../../../../sections/StrokeSection/StrokeSection";
import { TypographySection } from "../../../../../sections/TypographySection/TypographySection";
import type { TypographyData } from "../../../../../sections/TypographySection/types";
import type { StrokeData, StrokeTab, BrushDirection as StrokeBrushDirection } from "../../../../../sections/StrokeSection/types";
import type { JoinType as StrokeJoinType } from "../../../../../components/StrokeJoinControl/StrokeJoinControl";
import type { WidthProfile as StrokeWidthProfile } from "../../../../../components/StrokeWidthProfileSelect/StrokeWidthProfileSelect";
import type { PositionData } from "../../../../../sections/PositionSection/types";
import type { SizeData } from "../../../../../sections/SizeSection/types";
import type { RotationData } from "../../../../../sections/RotationSection/types";
import { StrokeStyleSelect, type StrokeStyle as SectionStrokeStyle } from "../../../../../components/StrokeStyleSelect/StrokeStyleSelect";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  SPACE_2XS,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
  SPACE_2XL,
  SIZE_FONT_XS,
  SIZE_FONT_SM,
  FONT_WEIGHT_MEDIUM,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../../../../themes/styles";

import { DocumentContext, SelectionContext, PageContext, ViewportContext } from "../contexts";
import type { StrokeStyle, ArrowheadType, DiagramNode, ShapeNode, TextNode, FrameNode, FramePreset, ShapeType, Connection, SymbolInstance, SymbolPart, TableNode } from "../types";
import { isFrameNode, isSymbolInstance, isTableNode, isShapeNode, isTextNode } from "../types";
import { framePresets, type FramePresetInfo } from "../mockData";
import { ThemeEditor } from "./ThemeEditor";
import { TextExportSection } from "./TextExportSection";
import { exportFrameToSVG } from "../export/exportToSVG";
import { exportToPNG } from "../export/exportToPNG";


// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: COLOR_SURFACE,
  borderLeft: `1px solid ${COLOR_BORDER}`,
  overflow: "hidden",
};

const emptyStateStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: SPACE_2XL,
  textAlign: "center",
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

const tabBarContainerStyle: CSSProperties = {
  padding: `${SPACE_SM} ${SPACE_LG}`,
  borderBottom: `1px solid ${COLOR_BORDER}`,
};

const contentStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
};

const sectionWrapperStyle: CSSProperties = {
  padding: `${SPACE_SM} ${SPACE_MD}`,
};

const footerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: SPACE_SM,
  padding: `${SPACE_SM} ${SPACE_LG}`,
  borderTop: `1px solid ${COLOR_BORDER}`,
  backgroundColor: COLOR_SURFACE,
};

const zoomDisplayStyle: CSSProperties = {
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
  minWidth: 48,
  textAlign: "center",
};

const exportContentStyle: CSSProperties = {
  flex: 1,
  overflow: "auto",
};

type InspectorTab = "design" | "export" | "theme";

// =============================================================================
// Options
// =============================================================================

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
  { id: "export" as const, label: "Export" },
  { id: "theme" as const, label: "Theme" },
];

export const DiagramInspector = memo(function DiagramInspector() {
  const documentCtx = useContext(DocumentContext);
  const selectionCtx = useContext(SelectionContext);
  const pageCtx = useContext(PageContext);
  const viewportCtx = useContext(ViewportContext);
  const [activeTab, setActiveTab] = useState<InspectorTab>("design");
  const [exportData, setExportData] = useState<ExportSectionData>({
    settings: [{ id: "export-1", scale: "1x", format: "PNG" }],
  });
  const [strokeTab, setStrokeTab] = useState<StrokeTab>("basic");
  const [connectionStrokeTab, setConnectionStrokeTab] = useState<StrokeTab>("basic");

  if (!documentCtx || !selectionCtx || !pageCtx || !viewportCtx) {
    return null;
  }

  const { document, setDocument } = documentCtx;
  const { selectedNodeIds, selectedConnectionIds, setSelectedNodeIds, setSelectedConnectionIds } = selectionCtx;
  const { activePageId, canvasPage } = pageCtx;
  const { zoom, setZoom } = viewportCtx;

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

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(zoom + 25, 400));
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(zoom - 25, 25));
  }, [zoom, setZoom]);

  // Find all frames in the canvas
  const allFrames = useMemo(() => {
    return pageNodes.filter(isFrameNode) as import("../types").FrameNode[];
  }, [pageNodes]);

  // Generate SVG preview for export section (first frame for preview)
  const previewSvg = useMemo(() => {
    if (allFrames.length === 0) {
      return undefined;
    }
    const symbolDef = pageCtx.symbolsPage.symbol;
    // Show first frame as preview
    return exportFrameToSVG(allFrames[0], pageNodes, pageConnections, symbolDef);
  }, [allFrames, pageNodes, pageConnections, pageCtx.symbolsPage.symbol]);

  // Export handler - exports all frames with all settings
  const handleExport = useCallback(async () => {
    const symbolDef = pageCtx.symbolsPage.symbol;

    for (const frame of allFrames) {
      const frameName = frame.preset;

      for (const setting of exportData.settings) {
        const format = setting.format.toLowerCase();
        const fileName = `${frameName}-${setting.scale}`;

        switch (format) {
          case "svg": {
            const svg = exportFrameToSVG(frame, pageNodes, pageConnections, symbolDef);
            downloadFile(svg, `${fileName}.svg`, "image/svg+xml");
            break;
          }
          case "png":
          case "jpg":
          case "jpeg":
          case "pdf":
          case "webp": {
            // For now, use PNG export (actual format conversion would need additional logic)
            const blob = await exportToPNG(document);
            downloadBlob(blob, `${fileName}.${format === "jpeg" ? "jpg" : format}`);
            break;
          }
        }
      }
    }
  }, [allFrames, pageNodes, pageConnections, pageCtx.symbolsPage.symbol, exportData.settings, document]);

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
      // For ShapeNode stroke settings (StrokeSection)
      setStrokeSettings: (data: StrokeData) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isShapeNode(n)
              ? {
                  ...n,
                  stroke: {
                    ...n.stroke,
                    style: data.style,
                    widthProfile: data.widthProfile as import("../types").WidthProfile,
                    join: data.join as import("../types").JoinType,
                    miterAngle: parseFloat(data.miterAngle) || 0,
                    frequency: parseFloat(data.frequency) || 0,
                    wiggle: parseFloat(data.wiggle) || 0,
                    smoothen: parseFloat(data.smoothen) || 0,
                    brushType: data.brushType as import("../types").BrushType,
                    brushDirection: data.brushDirection as import("../types").BrushDirection,
                    brushWidthProfile: data.brushWidthProfile as import("../types").WidthProfile,
                  },
                }
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
      // For TextNode typography (via TypographySection)
      setTypography: (data: TypographyData) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isTextNode(n)
              ? {
                  ...n,
                  textProps: {
                    ...n.textProps,
                    fontFamily: data.fontFamily,
                    fontWeight: data.fontWeight,
                    fontSize: data.fontSize,
                    lineHeight: data.lineHeight,
                    letterSpacing: data.letterSpacing,
                    textAlign: data.textAlign as import("../types").TextAlign,
                    verticalAlign: data.verticalAlign as import("../types").VerticalAlign,
                  },
                }
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
      // For SymbolInstance part overrides
      setPartOverride: (partId: string, override: Partial<SymbolPart>) => {
        updatePageNodes((nodes) =>
          nodes.map((n) => {
            if (n.id === nodeId && isSymbolInstance(n)) {
              const currentOverrides = n.partOverrides ?? {};
              const currentPartOverride = currentOverrides[partId] ?? {};
              return {
                ...n,
                partOverrides: {
                  ...currentOverrides,
                  [partId]: { ...currentPartOverride, ...override },
                },
              };
            }
            return n;
          }),
        );
      },
      clearPartOverride: (partId: string) => {
        updatePageNodes((nodes) =>
          nodes.map((n) => {
            if (n.id === nodeId && isSymbolInstance(n) && n.partOverrides) {
              const { [partId]: _, ...rest } = n.partOverrides;
              return {
                ...n,
                partOverrides: Object.keys(rest).length > 0 ? rest : undefined,
              };
            }
            return n;
          }),
        );
      },
      // Table-specific handlers
      addTableRow: () => {
        updatePageNodes((nodes) =>
          nodes.map((n) => {
            if (n.id === nodeId && isTableNode(n)) {
              const newRow = Array.from({ length: n.cells[0]?.length ?? 3 }, () => ({ content: "" }));
              const newRowHeights = [...n.rowHeights, 32];
              const newHeight = newRowHeights.reduce((sum, h) => sum + h, 0);
              return {
                ...n,
                cells: [...n.cells, newRow],
                rowHeights: newRowHeights,
                height: newHeight,
              };
            }
            return n;
          }),
        );
      },
      removeTableRow: () => {
        updatePageNodes((nodes) =>
          nodes.map((n) => {
            if (n.id === nodeId && isTableNode(n) && n.cells.length > 1) {
              const newCells = n.cells.slice(0, -1);
              const newRowHeights = n.rowHeights.slice(0, -1);
              const newHeight = newRowHeights.reduce((sum, h) => sum + h, 0);
              return {
                ...n,
                cells: newCells,
                rowHeights: newRowHeights,
                height: newHeight,
              };
            }
            return n;
          }),
        );
      },
      addTableColumn: () => {
        updatePageNodes((nodes) =>
          nodes.map((n) => {
            if (n.id === nodeId && isTableNode(n)) {
              const newCells = n.cells.map((row) => [...row, { content: "" }]);
              const newColumnWidths = [...n.columnWidths, 100];
              const newWidth = newColumnWidths.reduce((sum, w) => sum + w, 0);
              return {
                ...n,
                cells: newCells,
                columnWidths: newColumnWidths,
                width: newWidth,
              };
            }
            return n;
          }),
        );
      },
      removeTableColumn: () => {
        updatePageNodes((nodes) =>
          nodes.map((n) => {
            if (n.id === nodeId && isTableNode(n) && (n.cells[0]?.length ?? 0) > 1) {
              const newCells = n.cells.map((row) => row.slice(0, -1));
              const newColumnWidths = n.columnWidths.slice(0, -1);
              const newWidth = newColumnWidths.reduce((sum, w) => sum + w, 0);
              return {
                ...n,
                cells: newCells,
                columnWidths: newColumnWidths,
                width: newWidth,
              };
            }
            return n;
          }),
        );
      },
      setTableHeaderRow: (hasHeaderRow: boolean) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isTableNode(n) ? { ...n, hasHeaderRow } : n,
          ),
        );
      },
      setTableStrokeColor: (color: ColorValue) => {
        updatePageNodes((nodes) =>
          nodes.map((n) =>
            n.id === nodeId && isTableNode(n)
              ? { ...n, stroke: { ...n.stroke, color } }
              : n,
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
      setStrokeSettings: (data: StrokeData) => {
        updatePageConnections((connections) =>
          connections.map((c: Connection) =>
            c.id === connId
              ? {
                  ...c,
                  stroke: {
                    ...c.stroke,
                    style: data.style,
                    widthProfile: data.widthProfile as import("../types").WidthProfile,
                    join: data.join as import("../types").JoinType,
                    miterAngle: parseFloat(data.miterAngle) || 0,
                    frequency: parseFloat(data.frequency) || 0,
                    wiggle: parseFloat(data.wiggle) || 0,
                    smoothen: parseFloat(data.smoothen) || 0,
                    brushType: data.brushType as import("../types").BrushType,
                    brushDirection: data.brushDirection as import("../types").BrushDirection,
                    brushWidthProfile: data.brushWidthProfile as import("../types").WidthProfile,
                  },
                }
              : c,
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
      const commonType = getCommonShapeValue((n) => n.shape);
      const commonStrokeWidth = getCommonShapeValue((n) => n.stroke.width);
      const commonStrokeStyle = getCommonShapeValue((n) => n.stroke.style);
      const firstShape = selectedShapeNodes[0];

      return (
        <div style={contentStyle}>
          <SectionHeader
            title={`${selectedShapeNodes.length} Shapes Selected`}
            action={
              <IconButton
                icon={<LuTrash2 size={16} />}
                aria-label="Delete shapes"
                size="sm"
                variant="ghost"
                onClick={multiNodeHandlers.delete}
              />
            }
          />

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
              <StrokeStyleSelect
                value={(commonStrokeStyle ?? "solid") as SectionStrokeStyle}
                onChange={multiNodeHandlers.setStrokeStyle as (v: SectionStrokeStyle) => void}
                size="sm"
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
            : isSymbolInstance(selectedNode)
              ? "Instance Properties"
              : isTableNode(selectedNode)
                ? "Table Properties"
                : "Group Properties";

      return (
        <div style={contentStyle}>
          <SectionHeader
            title={nodeTitle}
            action={
              <IconButton
                icon={<LuTrash2 size={16} />}
                aria-label="Delete element"
                size="sm"
                variant="ghost"
                onClick={nodeHandlers.delete}
              />
            }
          />

          {/* Shape Type (only for shapes) */}
          {isShapeNode(selectedNode) && (
            <PropertySection title="Type">
              <Select
                options={shapeTypeOptions}
                value={selectedNode.shape}
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

          <div style={sectionWrapperStyle}>
            <PositionSection
              data={positionData}
              onChange={handlePositionChange}
            />
          </div>

          <div style={sectionWrapperStyle}>
            <SizeSection
              data={sizeData}
              onChange={handleSizeChange}
            />
          </div>

          <div style={sectionWrapperStyle}>
            <RotationSection
              data={rotationData}
              onChange={handleRotationChange}
              showTransformButtons={false}
            />
          </div>

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
              </PropertySection>

              <PropertySection title="Stroke Settings">
                <StrokeSection
                  data={{
                    tab: strokeTab,
                    style: selectedNode.stroke.style as SectionStrokeStyle,
                    widthProfile: (selectedNode.stroke.widthProfile ?? "uniform") as StrokeWidthProfile,
                    join: (selectedNode.stroke.join ?? "miter") as StrokeJoinType,
                    miterAngle: String(selectedNode.stroke.miterAngle ?? 0),
                    frequency: String(selectedNode.stroke.frequency ?? 0),
                    wiggle: String(selectedNode.stroke.wiggle ?? 0),
                    smoothen: String(selectedNode.stroke.smoothen ?? 0),
                    brushType: (selectedNode.stroke.brushType ?? "smooth") as import("../../../../../sections/StrokeSection/types").BrushType,
                    brushDirection: (selectedNode.stroke.brushDirection ?? "left") as StrokeBrushDirection,
                    brushWidthProfile: (selectedNode.stroke.brushWidthProfile ?? "uniform") as StrokeWidthProfile,
                  }}
                  onChange={(data) => {
                    setStrokeTab(data.tab);
                    nodeHandlers.setStrokeSettings(data);
                  }}
                />
              </PropertySection>
            </>
          )}

          {/* Typography (only for text nodes) */}
          {isTextNode(selectedNode) && (
            <>
              <PropertySection title="Typography">
                <TypographySection
                  data={{
                    fontFamily: selectedNode.textProps.fontFamily,
                    fontWeight: selectedNode.textProps.fontWeight,
                    fontSize: selectedNode.textProps.fontSize,
                    lineHeight: selectedNode.textProps.lineHeight,
                    letterSpacing: selectedNode.textProps.letterSpacing,
                    textAlign: selectedNode.textProps.textAlign,
                    verticalAlign: selectedNode.textProps.verticalAlign,
                  }}
                  onChange={nodeHandlers.setTypography}
                  showFontIcon="never"
                />
              </PropertySection>
              <PropertySection title="Text Color">
                <ColorInput
                  value={selectedNode.textProps.color}
                  onChange={nodeHandlers.setTextColor}
                  size="sm"
                  showVisibilityToggle
                />
              </PropertySection>
            </>
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

          {/* Symbol Instance Overrides */}
          {isSymbolInstance(selectedNode) && (
            <InstanceOverridesEditor
              instance={selectedNode}
              symbolDef={pageCtx.symbolsPage.symbol}
              onSetOverride={nodeHandlers.setPartOverride}
              onClearOverride={nodeHandlers.clearPartOverride}
            />
          )}

          {/* Table Properties */}
          {isTableNode(selectedNode) && (
            <>
              <PropertySection title="Structure">
                <PropertyRow label="Rows">
                  <div style={{ display: "flex", alignItems: "center", gap: SPACE_XS }}>
                    <span style={{ fontSize: SIZE_FONT_SM, minWidth: 20, textAlign: "center" }}>
                      {selectedNode.cells.length}
                    </span>
                    <IconButton
                      icon={<LuMinus size={14} />}
                      aria-label="Remove row"
                      size="sm"
                      variant="ghost"
                      onClick={nodeHandlers.removeTableRow}
                      disabled={selectedNode.cells.length <= 1}
                    />
                    <IconButton
                      icon={<LuPlus size={14} />}
                      aria-label="Add row"
                      size="sm"
                      variant="ghost"
                      onClick={nodeHandlers.addTableRow}
                    />
                  </div>
                </PropertyRow>
                <PropertyRow label="Columns">
                  <div style={{ display: "flex", alignItems: "center", gap: SPACE_XS }}>
                    <span style={{ fontSize: SIZE_FONT_SM, minWidth: 20, textAlign: "center" }}>
                      {selectedNode.cells[0]?.length ?? 0}
                    </span>
                    <IconButton
                      icon={<LuMinus size={14} />}
                      aria-label="Remove column"
                      size="sm"
                      variant="ghost"
                      onClick={nodeHandlers.removeTableColumn}
                      disabled={(selectedNode.cells[0]?.length ?? 0) <= 1}
                    />
                    <IconButton
                      icon={<LuPlus size={14} />}
                      aria-label="Add column"
                      size="sm"
                      variant="ghost"
                      onClick={nodeHandlers.addTableColumn}
                    />
                  </div>
                </PropertyRow>
              </PropertySection>

              <PropertySection title="Options">
                <PropertyRow label="Header Row">
                  <Checkbox
                    checked={selectedNode.hasHeaderRow}
                    onChange={nodeHandlers.setTableHeaderRow}
                    size="sm"
                  />
                </PropertyRow>
              </PropertySection>

              <PropertySection title="Border">
                <ColorInput
                  value={selectedNode.stroke.color}
                  onChange={nodeHandlers.setTableStrokeColor}
                  size="sm"
                  showVisibilityToggle
                />
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
          <SectionHeader
            title="Connection Properties"
            action={
              <IconButton
                icon={<LuTrash2 size={16} />}
                aria-label="Delete connection"
                size="sm"
                variant="ghost"
                onClick={connectionHandlers.delete}
              />
            }
          />

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
          </PropertySection>

          <PropertySection title="Stroke Settings">
            <StrokeSection
              data={{
                tab: connectionStrokeTab,
                style: selectedConnection.stroke.style as SectionStrokeStyle,
                widthProfile: (selectedConnection.stroke.widthProfile ?? "uniform") as StrokeWidthProfile,
                join: (selectedConnection.stroke.join ?? "miter") as StrokeJoinType,
                miterAngle: String(selectedConnection.stroke.miterAngle ?? 0),
                frequency: String(selectedConnection.stroke.frequency ?? 0),
                wiggle: String(selectedConnection.stroke.wiggle ?? 0),
                smoothen: String(selectedConnection.stroke.smoothen ?? 0),
                brushType: (selectedConnection.stroke.brushType ?? "smooth") as import("../../../../../sections/StrokeSection/types").BrushType,
                brushDirection: (selectedConnection.stroke.brushDirection ?? "left") as StrokeBrushDirection,
                brushWidthProfile: (selectedConnection.stroke.brushWidthProfile ?? "uniform") as StrokeWidthProfile,
              }}
              onChange={(data) => {
                setConnectionStrokeTab(data.tab);
                connectionHandlers.setStrokeSettings(data);
              }}
            />
          </PropertySection>

          <PropertySection title="Arrows">
            <PropertyRow label="Start">
              <ArrowheadSelect
                value={selectedConnection.startArrow as ArrowheadSelectType}
                onChange={connectionHandlers.setStartArrow as (v: ArrowheadSelectType) => void}
                size="sm"
                direction="start"
                aria-label="Start arrowhead"
              />
            </PropertyRow>
            <PropertyRow label="End">
              <ArrowheadSelect
                value={selectedConnection.endArrow as ArrowheadSelectType}
                onChange={connectionHandlers.setEndArrow as (v: ArrowheadSelectType) => void}
                size="sm"
                direction="end"
                aria-label="End arrowhead"
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

  // Render export content
  const renderExportContent = () => {
    // Show empty state if no frames exist
    if (allFrames.length === 0) {
      return (
        <div style={emptyStateStyle}>
          No Frames to export
        </div>
      );
    }

    return (
      <div style={exportContentStyle}>
        <ExportSection
          data={exportData}
          onChange={setExportData}
          svgContent={previewSvg}
          selectionCount={allFrames.length}
          selectionLabel="Frame"
          onExport={handleExport}
        />
        <TextExportSection
          frames={allFrames}
          allNodes={pageNodes}
          allConnections={pageConnections}
          symbolDef={pageCtx.symbolsPage.symbol}
        />
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
      {activeTab === "design" && renderDesignContent()}
      {activeTab === "export" && renderExportContent()}
      {activeTab === "theme" && <ThemeEditor />}

      {/* Zoom controls footer */}
      <div style={footerStyle}>
        <Tooltip content="Zoom Out" placement="top">
          <IconButton
            icon={<LuZoomOut size={16} />}
            aria-label="Zoom out"
            size="sm"
            variant="ghost"
            onClick={handleZoomOut}
          />
        </Tooltip>
        <span style={zoomDisplayStyle}>{zoom}%</span>
        <Tooltip content="Zoom In" placement="top">
          <IconButton
            icon={<LuZoomIn size={16} />}
            aria-label="Zoom in"
            size="sm"
            variant="ghost"
            onClick={handleZoomIn}
          />
        </Tooltip>
      </div>
    </div>
  );
});

// =============================================================================
// Instance Overrides Editor
// =============================================================================

type InstanceOverridesEditorProps = {
  instance: SymbolInstance;
  symbolDef: import("../types").SymbolDefinition | null;
  onSetOverride: (partId: string, override: Partial<SymbolPart>) => void;
  onClearOverride: (partId: string) => void;
};

const partLabelStyle: CSSProperties = {
  fontSize: SIZE_FONT_SM,
  fontWeight: FONT_WEIGHT_MEDIUM,
  color: COLOR_TEXT,
  marginBottom: SPACE_2XS,
};

const overrideIndicatorStyle: CSSProperties = {
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
  marginLeft: SPACE_XS,
};

const resetButtonStyle: CSSProperties = {
  fontSize: SIZE_FONT_XS,
  color: COLOR_TEXT_MUTED,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  marginLeft: SPACE_XS,
  textDecoration: "underline",
};

const InstanceOverridesEditor = memo(function InstanceOverridesEditor({
  instance,
  symbolDef,
  onSetOverride,
  onClearOverride,
}: InstanceOverridesEditorProps) {
  if (!symbolDef) {
    return (
      <PropertySection title="Overrides">
        <div style={{ color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_SM }}>
          No symbol definition found
        </div>
      </PropertySection>
    );
  }

  // Get the variant (if any)
  const variant = symbolDef.variants[instance.variantId];

  // Resolve part values: Base → Variant → Instance Override
  const resolvedParts = symbolDef.parts.map((basePart) => {
    const variantOverride = variant?.parts[basePart.id] ?? {};
    const instanceOverride = instance.partOverrides?.[basePart.id] ?? {};
    return {
      base: basePart,
      resolved: { ...basePart, ...variantOverride, ...instanceOverride } as SymbolPart,
      hasOverride: Boolean(instance.partOverrides?.[basePart.id]),
    };
  });

  return (
    <PropertySection title="Part Overrides">
      {resolvedParts.map(({ base, resolved, hasOverride }) => (
        <div key={base.id} style={{ marginBottom: SPACE_MD }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={partLabelStyle}>{base.name}</span>
            {hasOverride && (
              <>
                <span style={overrideIndicatorStyle}>(modified)</span>
                <button
                  type="button"
                  style={resetButtonStyle}
                  onClick={() => onClearOverride(base.id)}
                >
                  Reset
                </button>
              </>
            )}
          </div>

          {/* Shape part overrides */}
          {resolved.type === "shape" && (
            <>
              <PropertyRow label="Fill">
                <ColorInput
                  value={resolved.fill}
                  onChange={(fill) => onSetOverride(base.id, { fill })}
                  size="sm"
                  showVisibilityToggle
                />
              </PropertyRow>
              <PropertyRow label="Stroke">
                <ColorInput
                  value={resolved.stroke.color}
                  onChange={(color) =>
                    onSetOverride(base.id, {
                      stroke: { ...resolved.stroke, color },
                    })
                  }
                  size="sm"
                  showVisibilityToggle
                />
              </PropertyRow>
            </>
          )}

          {/* Text part overrides */}
          {resolved.type === "text" && (
            <>
              <PropertyRow label="Content">
                <Input
                  value={resolved.content}
                  onChange={(content) => onSetOverride(base.id, { content })}
                  size="sm"
                  placeholder="Text content"
                />
              </PropertyRow>
              <PropertyRow label="Color">
                <ColorInput
                  value={resolved.textProps.color}
                  onChange={(color) =>
                    onSetOverride(base.id, {
                      textProps: { ...resolved.textProps, color },
                    })
                  }
                  size="sm"
                  showVisibilityToggle
                />
              </PropertyRow>
            </>
          )}
        </div>
      ))}

      {resolvedParts.length === 0 && (
        <div style={{ color: COLOR_TEXT_MUTED, fontSize: SIZE_FONT_SM }}>
          No editable parts
        </div>
      )}
    </PropertySection>
  );
});

// =============================================================================
// Helper Functions
// =============================================================================

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement("a");
  a.href = url;
  a.download = filename;
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
