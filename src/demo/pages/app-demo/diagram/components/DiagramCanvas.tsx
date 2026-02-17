/**
 * @file DiagramCanvas - Main canvas area with nodes, connections, and grid
 */

import {
  memo,
  useContext,
  useCallback,
  useMemo,
  useState,
  useRef,
  useEffect,
  type CSSProperties,
  type DragEvent,
} from "react";

import { Canvas } from "../../../../../canvas/Canvas/Canvas";
import { CanvasGridLayer } from "../../../../../canvas/CanvasGridLayer/CanvasGridLayer";
import {
  CanvasHorizontalRuler,
  CanvasVerticalRuler,
  CanvasRulerCorner,
} from "../../../../../canvas/CanvasRuler/CanvasRuler";
import { BoundingBox, type HandlePosition } from "../../../../../canvas/BoundingBox/BoundingBox";
import type { ViewportState, GestureConfig } from "../../../../../canvas/core/types";

import { DocumentContext, SelectionContext, GridContext, ToolContext, PageContext, ViewportContext } from "../contexts";
import { createNode, createConnection, createFrameNodeCustom, createTableNode } from "../mockData";
import { snapToGrid } from "../hooks/useGridSnap";
import type { DiagramNode, NodeType, ConnectionPosition, GroupNode, FrameNode, SymbolInstance, SymbolDefinition, SymbolsPage, ToolType, ShapeType, TableNode } from "../types";
import { isSymbolInstance, isFrameNode, isTableNode } from "../types";

// =============================================================================
// Drawing Mode Types
// =============================================================================

type DrawingState = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
} | null;

// Check if a tool is a drawing tool (shape or frame)
function isDrawingTool(tool: ToolType): tool is ShapeType | "text" | "frame" | "table" {
  return tool !== "select" && tool !== "pan" && tool !== "connection" && tool !== "group" && tool !== "instance";
}

// Type guard for group nodes
function isGroupNode(node: DiagramNode): node is GroupNode {
  return node.type === "group";
}

// Get all child IDs for selected groups and frames
function getGroupChildIds(nodes: DiagramNode[], selectedIds: Set<string>): Set<string> {
  const childIds = new Set<string>();
  for (const node of nodes) {
    if (selectedIds.has(node.id)) {
      if (isGroupNode(node) || isFrameNode(node)) {
        for (const childId of node.children) {
          childIds.add(childId);
        }
      }
    }
  }
  return childIds;
}

import { NodeRenderer } from "./NodeRenderer";
import { ConnectionRenderer, ArrowMarkerDefs } from "./ConnectionRenderer";
import { DiagramBottomToolbar } from "./DiagramBottomToolbar";
import { MarqueeSelection, intersectsMarquee, type MarqueeState } from "./MarqueeSelection";
import { DrawingPreview } from "./DrawingPreview";
import { SymbolInstanceRenderer, findFirstTextPartId } from "./SymbolInstanceRenderer";
import { FrameRenderer } from "./FrameRenderer";
import { TableRenderer, type TableEditingState } from "./TableRenderer";

// Symbol editing state type
type SymbolEditingState = {
  instanceId: string;
  partId: string;
} | null;

// =============================================================================
// Styles
// =============================================================================

const baseContainerStyle: CSSProperties = {
  height: "100%",
  width: "100%",
  display: "flex",
  flexDirection: "column",
};

const INITIAL_VIEWPORT: ViewportState = { x: -50, y: -50, scale: 1 };

// =============================================================================
// Node Wrapper (for memoization)
// =============================================================================

type NodeWrapperProps = {
  node: DiagramNode;
  selected: boolean;
  editing: boolean;
  onContentChange: (nodeId: string, content: string) => void;
  onEditEnd: () => void;
  symbolDef: SymbolDefinition | null;
  /** For Symbol instances: which part is being edited */
  editingPartId?: string | null;
  /** For Symbol instances: callback when part content changes */
  onPartContentChange?: (instanceId: string, partId: string, content: string) => void;
  /** For Table nodes: which cell is being edited */
  editingTableCell?: { rowIndex: number; colIndex: number } | null;
  /** For Table nodes: callback when cell content changes */
  onTableCellContentChange?: (nodeId: string, rowIndex: number, colIndex: number, content: string) => void;
};

const NodeWrapper = memo(function NodeWrapper({
  node,
  selected,
  editing,
  onContentChange,
  onEditEnd,
  symbolDef,
  editingPartId,
  onPartContentChange,
  editingTableCell,
  onTableCellContentChange,
}: NodeWrapperProps) {
  // Render symbol instances using SymbolInstanceRenderer
  if (isSymbolInstance(node)) {
    return (
      <SymbolInstanceRenderer
        instance={node}
        symbolDef={symbolDef}
        selected={selected}
        editingPartId={editingPartId}
        onPartContentChange={onPartContentChange}
        onEditEnd={onEditEnd}
      />
    );
  }

  // Render frame nodes using FrameRenderer
  if (isFrameNode(node)) {
    return (
      <FrameRenderer
        node={node}
        selected={selected}
      />
    );
  }

  // Render table nodes using TableRenderer
  if (isTableNode(node)) {
    return (
      <TableRenderer
        node={node}
        selected={selected}
        editingCell={editingTableCell}
        onCellContentChange={onTableCellContentChange}
        onEditEnd={onEditEnd}
      />
    );
  }

  // Render regular nodes
  return (
    <NodeRenderer
      node={node}
      selected={selected}
      editing={editing}
      onContentChange={onContentChange}
      onEditEnd={onEditEnd}
    />
  );
});

// =============================================================================
// Multi-selection bounds calculator
// =============================================================================

type SelectionBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function calculateSelectionBounds(nodes: DiagramNode[], selectedIds: Set<string>): SelectionBounds | null {
  const selectedNodes = nodes.filter((n) => selectedIds.has(n.id));
  if (selectedNodes.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  selectedNodes.forEach((node) => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// =============================================================================
// Main Component
// =============================================================================

export const DiagramCanvas = memo(function DiagramCanvas() {
  const documentCtx = useContext(DocumentContext);
  const selectionCtx = useContext(SelectionContext);
  const gridCtx = useContext(GridContext);
  const toolCtx = useContext(ToolContext);
  const pageCtx = useContext(PageContext);
  const viewportCtx = useContext(ViewportContext);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [viewport, setViewportState] = useState(INITIAL_VIEWPORT);

  // Track if viewport update originated internally (to prevent feedback loop)
  const isInternalZoomUpdateRef = useRef(false);

  // Sync viewport scale with ViewportContext zoom
  const setViewport = useCallback((updater: ViewportState | ((prev: ViewportState) => ViewportState)) => {
    setViewportState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Sync scale to ViewportContext zoom (convert to percentage)
      if (viewportCtx && next.scale !== prev.scale) {
        isInternalZoomUpdateRef.current = true;
        viewportCtx.setZoom(Math.round(next.scale * 100));
      }
      return next;
    });
  }, [viewportCtx]);

  // Sync ViewportContext zoom to viewport scale (only for external updates)
  useEffect(() => {
    if (!viewportCtx) return;
    // Skip if this update originated from internal zoom (wheel/pinch)
    if (isInternalZoomUpdateRef.current) {
      isInternalZoomUpdateRef.current = false;
      return;
    }
    const newScale = viewportCtx.zoom / 100;
    setViewportState((prev) => {
      if (Math.abs(prev.scale - newScale) < 0.001) return prev;
      return { ...prev, scale: newScale };
    });
  }, [viewportCtx?.zoom]);

  // Connection tool state
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string;
    position: ConnectionPosition;
  } | null>(null);

  // Marquee selection state
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const isMarqueeDragging = useRef(false);

  // Drawing mode state
  const [drawingState, setDrawingState] = useState<DrawingState>(null);
  const isDrawing = useRef(false);

  // Drag state - tracks original positions for proper snap behavior
  const dragStartRef = useRef<{
    nodes: Map<string, { x: number; y: number; width: number; height: number }>;
  } | null>(null);

  // Direct drag state - for dragging nodes without pre-selection
  const directDragRef = useRef<{
    nodeId: string;
    startScreenX: number;
    startScreenY: number;
    startCanvasX: number;
    startCanvasY: number;
    isDragging: boolean;
    shiftKey: boolean;
  } | null>(null);

  // Text editing state
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Symbol instance editing state (tracks which instance and which part)
  const [editingSymbolState, setEditingSymbolState] = useState<SymbolEditingState>(null);

  // Table editing state (tracks which table and which cell)
  const [editingTableState, setEditingTableState] = useState<TableEditingState>(null);

  // Track if we're in direct drag mode (to keep pointer events active on node)
  const [directDragNodeId, setDirectDragNodeId] = useState<string | null>(null);

  // Drag threshold in pixels (to distinguish click from drag)
  const DRAG_THRESHOLD = 4;

  // Measure container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width: width - 20, height: height - 20 });
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Escape key to cancel drawing mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const currentTool = toolCtx?.activeTool;
        if (isDrawing.current || drawingState) {
          // Cancel drawing
          isDrawing.current = false;
          setDrawingState(null);
          toolCtx?.setActiveTool("select");
        } else if (currentTool && isDrawingTool(currentTool)) {
          // Exit drawing mode without drawing
          toolCtx?.setActiveTool("select");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [drawingState, toolCtx]);

  if (!documentCtx || !selectionCtx || !gridCtx || !toolCtx || !pageCtx || !viewportCtx) {
    return null;
  }

  const { document, setDocument } = documentCtx;
  const { selectedNodeIds, selectedConnectionIds, setSelectedNodeIds, setSelectedConnectionIds } = selectionCtx;
  const { gridEnabled, snapToGrid: snapEnabled, gridSize } = gridCtx;
  const { activeTool } = toolCtx;
  const { activePage, activePageId, canvasPage, symbolsPage } = pageCtx;
  const symbolDef = symbolsPage.symbol;

  // Helper to update current page's nodes (only canvas page has nodes)
  const updatePageNodes = useCallback(
    (updater: (nodes: DiagramNode[]) => DiagramNode[]) => {
      if (activePageId !== "canvas") return; // Symbols page doesn't have nodes array
      setDocument((prev) => ({
        ...prev,
        canvasPage: {
          ...prev.canvasPage,
          nodes: updater(prev.canvasPage.nodes),
        },
      }));
    },
    [setDocument, activePageId],
  );

  // Helper to update canvas page's connections (only canvas page has connections)
  const updatePageConnections = useCallback(
    (updater: (connections: typeof canvasPage.connections) => typeof canvasPage.connections) => {
      if (activePageId !== "canvas") return; // Symbols page doesn't have connections
      setDocument((prev) => ({
        ...prev,
        canvasPage: {
          ...prev.canvasPage,
          connections: updater(prev.canvasPage.connections),
        },
      }));
    },
    [setDocument, activePageId],
  );

  // Dynamic container style with theme background
  const containerStyle = useMemo((): CSSProperties => ({
    ...baseContainerStyle,
    backgroundColor: document.theme.canvasBackground.hex,
  }), [document.theme.canvasBackground.hex]);

  // Canvas style with cursor for drawing mode
  const canvasStyle = useMemo((): CSSProperties => ({
    cursor: isDrawingTool(activeTool) ? "crosshair" : undefined,
  }), [activeTool]);

  // Gesture config to prevent pan when interacting with BoundingBox
  const gestureConfig = useMemo((): Partial<GestureConfig> => ({
    shouldAllowPan: (e: PointerEvent) => {
      const target = e.target as Element;
      // Skip pan if clicking on BoundingBox or its children
      return target.closest('[data-testid="bounding-box"]') === null;
    },
  }), []);

  // Handle text content change (for TextNode)
  const handleContentChange = useCallback(
    (nodeId: string, content: string) => {
      updatePageNodes((nodes) =>
        nodes.map((n) =>
          n.id === nodeId && n.type === "text" ? { ...n, content } : n,
        ),
      );
    },
    [updatePageNodes],
  );

  // Handle Symbol instance part content change
  const handleSymbolPartContentChange = useCallback(
    (instanceId: string, partId: string, content: string) => {
      updatePageNodes((nodes) =>
        nodes.map((n) => {
          if (n.id === instanceId && isSymbolInstance(n)) {
            return {
              ...n,
              partOverrides: {
                ...n.partOverrides,
                [partId]: {
                  ...n.partOverrides?.[partId],
                  content,
                },
              },
            };
          }
          return n;
        }),
      );
    },
    [updatePageNodes],
  );

  // Handle Table cell content change
  const handleTableCellContentChange = useCallback(
    (nodeId: string, rowIndex: number, colIndex: number, content: string) => {
      updatePageNodes((nodes) =>
        nodes.map((n) => {
          if (n.id === nodeId && isTableNode(n)) {
            const newCells = n.cells.map((row, ri) =>
              ri === rowIndex
                ? row.map((cell, ci) =>
                    ci === colIndex ? { ...cell, content } : cell,
                  )
                : row,
            );
            return { ...n, cells: newCells };
          }
          return n;
        }),
      );
    },
    [updatePageNodes],
  );

  // Get nodes for canvas page (symbols page has no nodes)
  const pageNodes = activePageId === "canvas" ? canvasPage.nodes : [];
  const pageConnections = activePageId === "canvas" ? canvasPage.connections : [];

  // Separate frame nodes and get child IDs
  const { frameNodes, childNodeIds, topLevelNodes } = useMemo(() => {
    const frames: FrameNode[] = [];
    const childIds = new Set<string>();

    // Collect all frames and their children
    for (const node of pageNodes) {
      if (isFrameNode(node)) {
        frames.push(node);
        for (const childId of node.children) {
          childIds.add(childId);
        }
      }
    }

    // Top-level nodes are non-frame nodes that are not children of any frame
    const topLevel = pageNodes.filter(
      (node) => !isFrameNode(node) && !childIds.has(node.id)
    );

    return { frameNodes: frames, childNodeIds: childIds, topLevelNodes: topLevel };
  }, [pageNodes]);

  // Get child nodes for a frame
  const getFrameChildren = useCallback(
    (frame: FrameNode): DiagramNode[] => {
      return frame.children
        .map((childId) => pageNodes.find((n) => n.id === childId))
        .filter((n): n is DiagramNode => n !== undefined);
    },
    [pageNodes],
  );

  // Generate symbol variant previews for Symbols page
  const symbolPreviewInstances = useMemo(() => {
    if (activePageId !== "symbols" || !symbolDef) return [];

    const variantEntries = Object.entries(symbolDef.variants);
    const previewWidth = symbolDef.width;
    const previewHeight = symbolDef.height;
    const padding = 40;
    const cols = 4;

    return variantEntries.map(([variantId], index): SymbolInstance => ({
      id: `preview-${variantId}`,
      type: "instance",
      symbolId: symbolDef.id,
      variantId,
      x: padding + (index % cols) * (previewWidth + padding),
      y: padding + Math.floor(index / cols) * (previewHeight + padding + 30),
      width: previewWidth,
      height: previewHeight,
      rotation: 0,
    }));
  }, [activePageId, symbolDef]);

  // Handle move start - capture original positions (including group children)
  const handleMoveStart = useCallback(() => {
    const nodeMap = new Map<string, { x: number; y: number; width: number; height: number }>();
    const childIds = getGroupChildIds(pageNodes, selectedNodeIds);

    pageNodes.forEach((node) => {
      // Include selected nodes and their children
      if (selectedNodeIds.has(node.id) || childIds.has(node.id)) {
        nodeMap.set(node.id, { x: node.x, y: node.y, width: node.width, height: node.height });
      }
    });
    dragStartRef.current = { nodes: nodeMap };
  }, [pageNodes, selectedNodeIds]);

  // Handle node move - use cumulative delta from start position
  const handleNodeMove = useCallback(
    (deltaX: number, deltaY: number) => {
      const dragStart = dragStartRef.current;
      if (!dragStart) return;

      updatePageNodes((nodes) =>
        nodes.map((node) => {
          const original = dragStart.nodes.get(node.id);
          if (!original) return node;
          // Apply cumulative delta to ORIGINAL position, then snap
          const newX = snapEnabled ? snapToGrid(original.x + deltaX, gridSize, true) : original.x + deltaX;
          const newY = snapEnabled ? snapToGrid(original.y + deltaY, gridSize, true) : original.y + deltaY;
          return { ...node, x: newX, y: newY };
        }),
      );
    },
    [updatePageNodes, snapEnabled, gridSize],
  );

  // Handle move end - clear drag state
  const handleMoveEnd = useCallback(() => {
    dragStartRef.current = null;
  }, []);

  // Handle resize start - capture original bounds (including group children)
  const handleResizeStart = useCallback(() => {
    const nodeMap = new Map<string, { x: number; y: number; width: number; height: number }>();
    const childIds = getGroupChildIds(pageNodes, selectedNodeIds);

    pageNodes.forEach((node) => {
      if (selectedNodeIds.has(node.id) || childIds.has(node.id)) {
        nodeMap.set(node.id, { x: node.x, y: node.y, width: node.width, height: node.height });
      }
    });
    dragStartRef.current = { nodes: nodeMap };
  }, [pageNodes, selectedNodeIds]);

  // Handle node resize - use cumulative delta from start bounds
  const handleNodeResize = useCallback(
    (handle: HandlePosition, deltaX: number, deltaY: number) => {
      const dragStart = dragStartRef.current;
      if (!dragStart) return;

      updatePageNodes((nodes) =>
        nodes.map((node) => {
          const original = dragStart.nodes.get(node.id);
          if (!original) return node;
          // Create a temporary node with original bounds
          const tempNode = { ...node, ...original };
          // Apply resize delta to original bounds
          return applyResize(tempNode, handle, deltaX, deltaY, snapEnabled, gridSize);
        }),
      );
    },
    [updatePageNodes, snapEnabled, gridSize],
  );

  // Handle resize end - clear drag state
  const handleResizeEnd = useCallback(() => {
    dragStartRef.current = null;
  }, []);

  // Handle node rotation
  const handleNodeRotate = useCallback(
    (angle: number) => {
      updatePageNodes((nodes) =>
        nodes.map((node) =>
          selectedNodeIds.has(node.id) ? { ...node, rotation: angle } : node,
        ),
      );
    },
    [updatePageNodes, selectedNodeIds],
  );

  // Handle double-click to edit text (for text nodes, symbol instances, and tables)
  const handleBoundingBoxDoubleClick = useCallback(() => {
    if (selectedNodeIds.size === 1) {
      const nodeId = Array.from(selectedNodeIds)[0];
      const node = pageNodes.find((n) => n.id === nodeId);

      // Text nodes support inline editing
      if (node?.type === "text") {
        setEditingNodeId(nodeId);
        return;
      }

      // Symbol instances: find first text part and edit it
      if (node && isSymbolInstance(node)) {
        const textPartId = findFirstTextPartId(symbolDef);
        if (textPartId) {
          setEditingSymbolState({ instanceId: node.id, partId: textPartId });
        }
        return;
      }

      // Table nodes: edit first cell
      if (node && isTableNode(node)) {
        setEditingTableState({ nodeId: node.id, rowIndex: 0, colIndex: 0 });
      }
    }
  }, [selectedNodeIds, pageNodes, symbolDef]);

  // Handle edit end
  const handleEditEnd = useCallback(() => {
    setEditingNodeId(null);
    setEditingSymbolState(null);
    setEditingTableState(null);
  }, []);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      // Account for rulers (20px each)
      const offsetX = screenX - rect.left - 20;
      const offsetY = screenY - rect.top - 20;
      return {
        x: offsetX / viewport.scale + viewport.x,
        y: offsetY / viewport.scale + viewport.y,
      };
    },
    [viewport],
  );

  // Handle node pointer down - start potential drag
  const handleNodePointerDown = useCallback(
    (nodeId: string, e: React.PointerEvent) => {
      if (activeTool === "connection") {
        // Connection tool: start or complete connection
        if (!connectionStart) {
          setConnectionStart({ nodeId, position: "right" });
        } else if (connectionStart.nodeId !== nodeId) {
          const newConnection = createConnection(
            connectionStart.nodeId,
            connectionStart.position,
            nodeId,
            "left",
          );
          updatePageConnections((connections) => [
            ...connections,
            {
              ...newConnection,
              stroke: {
                color: { ...document.theme.defaultConnectionStroke.color },
                width: document.theme.defaultConnectionStroke.width,
                style: document.theme.defaultConnectionStroke.style,
              },
              endArrow: document.theme.defaultConnectionArrow,
            },
          ]);
          setConnectionStart(null);
        }
        return;
      }

      // Select tool: start potential drag
      const canvasPos = screenToCanvas(e.clientX, e.clientY);

      // Immediately select the node (or toggle with shift)
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
      } else if (!selectedNodeIds.has(nodeId)) {
        // Only change selection if not already selected
        setSelectedNodeIds(new Set([nodeId]));
        setSelectedConnectionIds(new Set());
      }

      // Start tracking for potential drag
      directDragRef.current = {
        nodeId,
        startScreenX: e.clientX,
        startScreenY: e.clientY,
        startCanvasX: canvasPos.x,
        startCanvasY: canvasPos.y,
        isDragging: false,
        shiftKey: e.shiftKey,
      };

      // Mark this node as being directly dragged (keeps pointer events active)
      setDirectDragNodeId(nodeId);

      // Capture original positions for all nodes that will be selected (including group children)
      const targetNodeIds = e.shiftKey
        ? new Set([...selectedNodeIds, nodeId])
        : selectedNodeIds.has(nodeId)
          ? selectedNodeIds
          : new Set([nodeId]);

      const childIds = getGroupChildIds(pageNodes, targetNodeIds);

      const nodeMap = new Map<string, { x: number; y: number; width: number; height: number }>();
      pageNodes.forEach((node) => {
        if (targetNodeIds.has(node.id) || childIds.has(node.id)) {
          nodeMap.set(node.id, { x: node.x, y: node.y, width: node.width, height: node.height });
        }
      });
      dragStartRef.current = { nodes: nodeMap };
    },
    [activeTool, connectionStart, updatePageConnections, document.theme, setSelectedNodeIds, setSelectedConnectionIds, screenToCanvas, selectedNodeIds, pageNodes],
  );

  // Handle pointer move for direct drag
  const handleDirectDragMove = useCallback(
    (e: React.PointerEvent) => {
      const directDrag = directDragRef.current;
      if (!directDrag) return;

      const dx = e.clientX - directDrag.startScreenX;
      const dy = e.clientY - directDrag.startScreenY;

      // Check if we've exceeded the drag threshold
      if (!directDrag.isDragging) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < DRAG_THRESHOLD) {
          return; // Not dragging yet
        }
        directDrag.isDragging = true;
      }

      // Calculate canvas delta
      const currentCanvasPos = screenToCanvas(e.clientX, e.clientY);
      const deltaX = currentCanvasPos.x - directDrag.startCanvasX;
      const deltaY = currentCanvasPos.y - directDrag.startCanvasY;

      // Move all selected nodes
      handleNodeMove(deltaX, deltaY);
    },
    [screenToCanvas, handleNodeMove],
  );

  // Handle pointer up for direct drag
  const handleDirectDragEnd = useCallback(() => {
    const directDrag = directDragRef.current;
    if (directDrag) {
      directDragRef.current = null;
      dragStartRef.current = null;
      setDirectDragNodeId(null);
    }
  }, []);

  // Handle connection selection
  const handleConnectionSelect = useCallback(
    (connectionId: string) => {
      setSelectedConnectionIds(new Set([connectionId]));
      setSelectedNodeIds(new Set());
    },
    [setSelectedConnectionIds, setSelectedNodeIds],
  );

  // Handle canvas background click (start marquee, drawing, or deselect)
  const handleBackgroundPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Drawing mode: start drawing shape/frame
      if (isDrawingTool(activeTool)) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setDrawingState({
          startX: canvasPos.x,
          startY: canvasPos.y,
          currentX: canvasPos.x,
          currentY: canvasPos.y,
        });
        isDrawing.current = true;
        // Clear selection when starting to draw
        setSelectedNodeIds(new Set());
        setSelectedConnectionIds(new Set());
        return;
      }

      if (activeTool === "select") {
        // Start marquee selection
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setMarquee({
          startX: canvasPos.x,
          startY: canvasPos.y,
          currentX: canvasPos.x,
          currentY: canvasPos.y,
        });
        isMarqueeDragging.current = true;

        if (!e.shiftKey) {
          // Clear selection if not shift-clicking
          setSelectedNodeIds(new Set());
          setSelectedConnectionIds(new Set());
        }
      } else {
        // Deselect for other tools
        setSelectedNodeIds(new Set());
        setSelectedConnectionIds(new Set());
      }
      setConnectionStart(null);
    },
    [activeTool, screenToCanvas, setSelectedNodeIds, setSelectedConnectionIds],
  );

  // Handle pointer move (drawing + marquee + direct drag)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Handle drawing mode
      if (isDrawing.current && drawingState) {
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        setDrawingState((prev) =>
          prev ? { ...prev, currentX: canvasPos.x, currentY: canvasPos.y } : null,
        );
        return;
      }

      // Handle direct drag
      if (directDragRef.current) {
        handleDirectDragMove(e);
        return;
      }

      // Handle marquee drag
      if (!isMarqueeDragging.current || !marquee) return;

      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setMarquee((prev) =>
        prev ? { ...prev, currentX: canvasPos.x, currentY: canvasPos.y } : null,
      );
    },
    [marquee, drawingState, screenToCanvas, handleDirectDragMove],
  );

  // Minimum size for drawn shapes (in canvas units)
  const MIN_DRAW_SIZE = 20;

  // Handle pointer up (drawing + marquee + direct drag)
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Handle drawing end
      if (isDrawing.current && drawingState) {
        isDrawing.current = false;

        // Calculate drawn rectangle
        const x = Math.min(drawingState.startX, drawingState.currentX);
        const y = Math.min(drawingState.startY, drawingState.currentY);
        const width = Math.abs(drawingState.currentX - drawingState.startX);
        const height = Math.abs(drawingState.currentY - drawingState.startY);

        // Check minimum size
        if (width >= MIN_DRAW_SIZE && height >= MIN_DRAW_SIZE) {
          // Apply grid snap if enabled
          const snappedX = snapEnabled ? snapToGrid(x, gridSize, true) : x;
          const snappedY = snapEnabled ? snapToGrid(y, gridSize, true) : y;
          const snappedWidth = snapEnabled ? snapToGrid(width, gridSize, true) : width;
          const snappedHeight = snapEnabled ? snapToGrid(height, gridSize, true) : height;

          // Create node based on tool type
          let newNode: DiagramNode;
          if (activeTool === "frame") {
            newNode = createFrameNodeCustom(snappedX, snappedY, snappedWidth, snappedHeight);
          } else if (activeTool === "table") {
            // Calculate rows/columns from drawn size
            const cols = Math.max(2, Math.round(snappedWidth / 100));
            const rows = Math.max(2, Math.round(snappedHeight / 32));
            newNode = createTableNode(snappedX, snappedY, rows, cols, snappedWidth, snappedHeight);
          } else {
            newNode = createNode(activeTool as NodeType, snappedX, snappedY, snappedWidth, snappedHeight);
          }

          // Apply theme defaults for shape nodes
          if (newNode.type !== "text" && newNode.type !== "group" && newNode.type !== "frame" && newNode.type !== "instance" && newNode.type !== "table") {
            newNode = {
              ...newNode,
              fill: { ...document.theme.defaultNodeFill },
              stroke: {
                color: { ...document.theme.defaultNodeStroke.color },
                width: document.theme.defaultNodeStroke.width,
                style: document.theme.defaultNodeStroke.style,
              },
            };
          }

          updatePageNodes((nodes) => [...nodes, newNode]);

          // Select the new node
          setSelectedNodeIds(new Set([newNode.id]));
          setSelectedConnectionIds(new Set());
        }

        // Reset drawing state and return to select tool
        setDrawingState(null);
        toolCtx?.setActiveTool("select");
        return;
      }

      // Handle direct drag end
      if (directDragRef.current) {
        handleDirectDragEnd();
        return;
      }

      // Handle marquee end
      if (!isMarqueeDragging.current || !marquee) return;

      isMarqueeDragging.current = false;

      // Find nodes that intersect with the marquee (excluding Frames - Figma-like behavior)
      const intersectingNodeIds = pageNodes
        .filter((node) =>
          !isFrameNode(node) && // Exclude Frames from marquee selection
          intersectsMarquee(node.x, node.y, node.width, node.height, marquee),
        )
        .map((node) => node.id);

      if (intersectingNodeIds.length > 0) {
        if (e.shiftKey) {
          // Add to existing selection
          setSelectedNodeIds((prev) => {
            const next = new Set(prev);
            intersectingNodeIds.forEach((id) => next.add(id));
            return next;
          });
        } else {
          // Replace selection
          setSelectedNodeIds(new Set(intersectingNodeIds));
        }
        setSelectedConnectionIds(new Set());
      }

      setMarquee(null);
    },
    [marquee, drawingState, activeTool, pageNodes, snapEnabled, gridSize, document.theme, toolCtx, updatePageNodes, setSelectedNodeIds, setSelectedConnectionIds, handleDirectDragEnd],
  );

  // Handle DnD drop
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const data = e.dataTransfer.getData("application/diagram-shape");
      if (!data) return;

      try {
        const shapeData = JSON.parse(data) as { type: NodeType; width: number; height: number };
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        // Convert screen coordinates to canvas coordinates
        const canvasX = (e.clientX - rect.left - 20) / viewport.scale + viewport.x;
        const canvasY = (e.clientY - rect.top - 20) / viewport.scale + viewport.y;

        const x = snapEnabled ? snapToGrid(canvasX - shapeData.width / 2, gridSize, true) : canvasX - shapeData.width / 2;
        const y = snapEnabled ? snapToGrid(canvasY - shapeData.height / 2, gridSize, true) : canvasY - shapeData.height / 2;

        const newNode = createNode(shapeData.type, x, y, shapeData.width, shapeData.height);

        // Apply theme defaults (only for shape nodes - text, group, table nodes have their own defaults)
        const nodeWithDefaults =
          newNode.type !== "text" && newNode.type !== "group" && newNode.type !== "table"
            ? {
                ...newNode,
                fill: { ...document.theme.defaultNodeFill },
                stroke: {
                  color: { ...document.theme.defaultNodeStroke.color },
                  width: document.theme.defaultNodeStroke.width,
                  style: document.theme.defaultNodeStroke.style,
                },
              }
            : newNode;

        updatePageNodes((nodes) => [...nodes, nodeWithDefaults]);

        setSelectedNodeIds(new Set([newNode.id]));
        setSelectedConnectionIds(new Set());
      } catch {
        // Ignore invalid data
      }
    },
    [viewport, snapEnabled, gridSize, document.theme, updatePageNodes, setSelectedNodeIds, setSelectedConnectionIds],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  // All selectable nodes (page nodes + symbol previews on Symbols page)
  const allSelectableNodes = useMemo(() => {
    if (activePageId === "symbols") {
      return [...pageNodes, ...symbolPreviewInstances];
    }
    return pageNodes;
  }, [activePageId, pageNodes, symbolPreviewInstances]);

  // Selection bounds for bounding box (works for single or multiple nodes)
  const selectionBounds = useMemo(() => {
    if (selectedNodeIds.size === 0) return null;
    return calculateSelectionBounds(allSelectableNodes, selectedNodeIds);
  }, [allSelectableNodes, selectedNodeIds]);

  // Single selected node for rotation (only supported for single selection)
  const singleSelectedNode = useMemo(() => {
    if (selectedNodeIds.size !== 1) return null;
    const nodeId = Array.from(selectedNodeIds)[0];
    return allSelectableNodes.find((n) => n.id === nodeId) ?? null;
  }, [allSelectableNodes, selectedNodeIds]);

  // SVG layers (grid + connections + bounding box + marquee)
  const svgLayers = useMemo(
    () => (
      <>
        <ArrowMarkerDefs />
        {gridEnabled && <CanvasGridLayer minorSize={gridSize} majorSize={gridSize * 5} showOrigin />}
        {/* Connections */}
        {pageConnections.map((conn) => (
          <ConnectionRenderer
            key={conn.id}
            connection={conn}
            nodes={pageNodes}
            selected={selectedConnectionIds.has(conn.id)}
            onSelect={handleConnectionSelect}
          />
        ))}
        {/* Bounding box for selected nodes (hidden when editing text) */}
        {selectionBounds && !editingNodeId && !editingSymbolState && !editingTableState && (
          <BoundingBox
            x={selectionBounds.x}
            y={selectionBounds.y}
            width={selectionBounds.width}
            height={selectionBounds.height}
            rotation={singleSelectedNode?.rotation ?? 0}
            showRotationHandle={selectedNodeIds.size === 1}
            onMoveStart={handleMoveStart}
            onMove={handleNodeMove}
            onMoveEnd={handleMoveEnd}
            onResizeStart={handleResizeStart}
            onResize={handleNodeResize}
            onResizeEnd={handleResizeEnd}
            onRotate={singleSelectedNode ? handleNodeRotate : undefined}
            onDoubleClick={handleBoundingBoxDoubleClick}
          />
        )}
        {/* Marquee selection */}
        {marquee && <MarqueeSelection marquee={marquee} scale={viewport.scale} />}
        {/* Drawing preview */}
        {drawingState && isDrawingTool(activeTool) && (
          <DrawingPreview
            drawing={drawingState}
            toolType={activeTool}
            scale={viewport.scale}
          />
        )}
      </>
    ),
    [
      gridEnabled,
      gridSize,
      pageConnections,
      pageNodes,
      selectedConnectionIds,
      selectionBounds,
      singleSelectedNode,
      selectedNodeIds.size,
      editingNodeId,
      editingSymbolState,
      editingTableState,
      drawingState,
      activeTool,
      handleConnectionSelect,
      handleMoveStart,
      handleNodeMove,
      handleMoveEnd,
      handleResizeStart,
      handleNodeResize,
      handleResizeEnd,
      handleNodeRotate,
      handleBoundingBoxDoubleClick,
      marquee,
      viewport.scale,
    ],
  );

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Rulers */}
      <div style={{ display: "flex" }}>
        <CanvasRulerCorner size={20} />
        <CanvasHorizontalRuler viewport={viewport} width={dimensions.width} />
      </div>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        <CanvasVerticalRuler viewport={viewport} height={dimensions.height} />
        <div style={{ flex: 1, position: "relative" }}>
          <Canvas
            viewport={viewport}
            onViewportChange={setViewport}
            width={dimensions.width}
            height={dimensions.height}
            svgLayers={svgLayers}
            gestureConfig={gestureConfig}
            style={canvasStyle}
            onBackgroundPointerDown={handleBackgroundPointerDown}
          >
            {/* 1. Frames with children inside (relative coordinates) */}
            {frameNodes.map((frame) => {
              const isFrameSelected = selectedNodeIds.has(frame.id);
              const frameChildren = getFrameChildren(frame);

              return (
                <FrameRenderer
                  key={frame.id}
                  node={frame}
                  selected={isFrameSelected}
                  onFrameSelect={(e) => {
                    // Select frame when clicking on label or border
                    handleNodePointerDown(frame.id, e);
                  }}
                >
                  {/* Children rendered inside frame with relative coordinates */}
                  {frameChildren.map((child) => {
                    const isChildSelected = selectedNodeIds.has(child.id);
                    const isChildEditing = editingNodeId === child.id;
                    const isChildSymbolEditing = editingSymbolState?.instanceId === child.id;
                    const isChildTableEditing = editingTableState?.nodeId === child.id;
                    const isChildAnyEditing = isChildEditing || isChildSymbolEditing || isChildTableEditing;

                    // Adjust coordinates relative to frame
                    const adjustedChild = {
                      ...child,
                      x: child.x - frame.x,
                      y: child.y - frame.y,
                    };

                    return (
                      <div
                        key={child.id}
                        style={{
                          position: "absolute",
                          left: adjustedChild.x,
                          top: adjustedChild.y,
                          width: adjustedChild.width,
                          height: adjustedChild.height,
                          pointerEvents: isChildAnyEditing || !isChildSelected ? "auto" : "none",
                          zIndex: isChildSelected ? 1 : 0,
                        }}
                        onPointerDown={(e) => {
                          // Skip drag handling when editing (allow text selection)
                          if (isChildAnyEditing) return;
                          e.stopPropagation();
                          handleNodePointerDown(child.id, e);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          // Text nodes support inline editing
                          if (child.type === "text") {
                            setEditingNodeId(child.id);
                            return;
                          }
                          // Symbol instances: find first text part and edit it
                          if (isSymbolInstance(child)) {
                            const textPartId = findFirstTextPartId(symbolDef);
                            if (textPartId) {
                              setEditingSymbolState({ instanceId: child.id, partId: textPartId });
                            }
                            return;
                          }
                          // Table nodes: edit first cell
                          if (isTableNode(child)) {
                            setEditingTableState({ nodeId: child.id, rowIndex: 0, colIndex: 0 });
                          }
                        }}
                      >
                        <NodeWrapper
                          node={adjustedChild}
                          selected={isChildSelected}
                          editing={isChildEditing}
                          onContentChange={handleContentChange}
                          onEditEnd={handleEditEnd}
                          symbolDef={symbolDef}
                          editingPartId={isChildSymbolEditing ? editingSymbolState.partId : null}
                          onPartContentChange={handleSymbolPartContentChange}
                          editingTableCell={isChildTableEditing ? { rowIndex: editingTableState.rowIndex, colIndex: editingTableState.colIndex } : null}
                          onTableCellContentChange={handleTableCellContentChange}
                        />
                      </div>
                    );
                  })}
                </FrameRenderer>
              );
            })}
            {/* 2. Top-level nodes (not inside any frame) */}
            {topLevelNodes.map((node) => {
              const isSelected = selectedNodeIds.has(node.id);
              const isEditing = editingNodeId === node.id;
              const isSymbolEditing = editingSymbolState?.instanceId === node.id;
              const isTableEditing = editingTableState?.nodeId === node.id;
              const isAnyEditing = isEditing || isSymbolEditing || isTableEditing;
              const isDirectDragging = directDragNodeId === node.id;
              return (
                <div
                  key={node.id}
                  style={{
                    position: "absolute",
                    left: node.x,
                    top: node.y,
                    width: node.width,
                    height: node.height,
                    pointerEvents: isDirectDragging || isAnyEditing || !isSelected ? "auto" : "none",
                  }}
                  onPointerDown={(e) => {
                    // Skip drag handling when editing (allow text selection)
                    if (isAnyEditing) return;
                    e.stopPropagation();
                    handleNodePointerDown(node.id, e);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    // Text nodes support inline editing
                    if (node.type === "text") {
                      setEditingNodeId(node.id);
                      return;
                    }
                    // Symbol instances: find first text part and edit it
                    if (isSymbolInstance(node)) {
                      const textPartId = findFirstTextPartId(symbolDef);
                      if (textPartId) {
                        setEditingSymbolState({ instanceId: node.id, partId: textPartId });
                      }
                      return;
                    }
                    // Table nodes: edit first cell
                    if (isTableNode(node)) {
                      setEditingTableState({ nodeId: node.id, rowIndex: 0, colIndex: 0 });
                    }
                  }}
                >
                  <NodeWrapper
                    node={node}
                    selected={isSelected}
                    editing={isEditing}
                    onContentChange={handleContentChange}
                    onEditEnd={handleEditEnd}
                    symbolDef={symbolDef}
                    editingPartId={isSymbolEditing ? editingSymbolState.partId : null}
                    onPartContentChange={handleSymbolPartContentChange}
                    editingTableCell={isTableEditing ? { rowIndex: editingTableState.rowIndex, colIndex: editingTableState.colIndex } : null}
                    onTableCellContentChange={handleTableCellContentChange}
                  />
                </div>
              );
            })}
            {/* 3. Symbol variant previews (Symbols page only) */}
            {symbolPreviewInstances.map((instance) => {
              const isSelected = selectedNodeIds.has(instance.id);

              return (
                <div
                  key={instance.id}
                  style={{
                    position: "absolute",
                    left: instance.x,
                    top: instance.y,
                    width: instance.width,
                    height: instance.height,
                    pointerEvents: "auto",
                    cursor: "pointer",
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    // Select the variant preview
                    if (e.shiftKey) {
                      setSelectedNodeIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(instance.id)) {
                          next.delete(instance.id);
                        } else {
                          next.add(instance.id);
                        }
                        return next;
                      });
                    } else {
                      setSelectedNodeIds(new Set([instance.id]));
                      setSelectedConnectionIds(new Set());
                    }
                  }}
                >
                  <SymbolInstanceRenderer
                    instance={instance}
                    symbolDef={symbolDef}
                    selected={isSelected}
                  />
                  {/* Variant label */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: instance.height + 8,
                      fontSize: 12,
                      color: "var(--rei-color-text-muted)",
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                    }}
                  >
                    {symbolDef?.variants[instance.variantId]?.name ?? instance.variantId}
                  </div>
                </div>
              );
            })}
          </Canvas>
        </div>
      </div>

      {/* Bottom toolbar */}
      <DiagramBottomToolbar />
    </div>
  );
});

// =============================================================================
// Resize Helper
// =============================================================================

function applyResize(
  node: DiagramNode,
  handle: HandlePosition,
  deltaX: number,
  deltaY: number,
  snapEnabled: boolean,
  gridSize: number,
): DiagramNode {
  const { x, y, width, height, rotation } = node;
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const localDX = deltaX * cos - deltaY * sin;
  const localDY = deltaX * sin + deltaY * cos;

  let newX = x;
  let newY = y;
  let newWidth = width;
  let newHeight = height;

  switch (handle) {
    case "top-left":
      newX = x + localDX;
      newY = y + localDY;
      newWidth = Math.max(20, width - localDX);
      newHeight = Math.max(20, height - localDY);
      break;
    case "top":
      newY = y + localDY;
      newHeight = Math.max(20, height - localDY);
      break;
    case "top-right":
      newY = y + localDY;
      newWidth = Math.max(20, width + localDX);
      newHeight = Math.max(20, height - localDY);
      break;
    case "right":
      newWidth = Math.max(20, width + localDX);
      break;
    case "bottom-right":
      newWidth = Math.max(20, width + localDX);
      newHeight = Math.max(20, height + localDY);
      break;
    case "bottom":
      newHeight = Math.max(20, height + localDY);
      break;
    case "bottom-left":
      newX = x + localDX;
      newWidth = Math.max(20, width - localDX);
      newHeight = Math.max(20, height + localDY);
      break;
    case "left":
      newX = x + localDX;
      newWidth = Math.max(20, width - localDX);
      break;
  }

  if (snapEnabled) {
    newX = snapToGrid(newX, gridSize, true);
    newY = snapToGrid(newY, gridSize, true);
    newWidth = snapToGrid(newWidth, gridSize, true);
    newHeight = snapToGrid(newHeight, gridSize, true);
  }

  return { ...node, x: newX, y: newY, width: newWidth, height: newHeight };
}
