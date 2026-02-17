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

import { DocumentContext, SelectionContext, GridContext, ToolContext, PageContext } from "../contexts";
import { createNode, createConnection } from "../mockData";
import { snapToGrid } from "../hooks/useGridSnap";
import type { DiagramNode, NodeType, ConnectionPosition, GroupNode, FrameNode, SymbolInstance, SymbolDefinition, SymbolsPage } from "../types";
import { isSymbolInstance, isFrameNode } from "../types";

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
import { FloatingShapeToolbar } from "./FloatingShapeToolbar";
import { MarqueeSelection, intersectsMarquee, type MarqueeState } from "./MarqueeSelection";
import { SymbolInstanceRenderer } from "./SymbolInstanceRenderer";
import { FrameRenderer } from "./FrameRenderer";

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
};

const NodeWrapper = memo(function NodeWrapper({ node, selected, editing, onContentChange, onEditEnd, symbolDef }: NodeWrapperProps) {
  // Render symbol instances using SymbolInstanceRenderer
  if (isSymbolInstance(node)) {
    return (
      <SymbolInstanceRenderer
        instance={node}
        symbolDef={symbolDef}
        selected={selected}
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

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [viewport, setViewport] = useState(INITIAL_VIEWPORT);

  // Connection tool state
  const [connectionStart, setConnectionStart] = useState<{
    nodeId: string;
    position: ConnectionPosition;
  } | null>(null);

  // Marquee selection state
  const [marquee, setMarquee] = useState<MarqueeState | null>(null);
  const isMarqueeDragging = useRef(false);

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

  if (!documentCtx || !selectionCtx || !gridCtx || !toolCtx || !pageCtx) {
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
    backgroundColor: document.theme.canvasBackground,
  }), [document.theme.canvasBackground]);

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

  // Handle double-click to edit text
  const handleBoundingBoxDoubleClick = useCallback(() => {
    if (selectedNodeIds.size === 1) {
      const nodeId = Array.from(selectedNodeIds)[0];
      setEditingNodeId(nodeId);
    }
  }, [selectedNodeIds]);

  // Handle edit end
  const handleEditEnd = useCallback(() => {
    setEditingNodeId(null);
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

  // Handle canvas background click (start marquee or deselect)
  const handleBackgroundPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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

  // Handle pointer move (marquee + direct drag)
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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
    [marquee, screenToCanvas, handleDirectDragMove],
  );

  // Handle pointer up (marquee + direct drag)
  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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
    [marquee, pageNodes, setSelectedNodeIds, setSelectedConnectionIds, handleDirectDragEnd],
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

        // Apply theme defaults (only for shape nodes - text nodes don't have fill/stroke)
        const nodeWithDefaults =
          newNode.type !== "text" && newNode.type !== "group"
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
        {/* Bounding box for selected nodes */}
        {selectionBounds && (
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
                          pointerEvents: "auto",
                          position: "relative",
                          zIndex: isChildSelected ? 1 : 0,
                        }}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          handleNodePointerDown(child.id, e);
                        }}
                      >
                        <NodeWrapper
                          node={adjustedChild}
                          selected={isChildSelected}
                          editing={isChildEditing}
                          onContentChange={handleContentChange}
                          onEditEnd={handleEditEnd}
                          symbolDef={symbolDef}
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
              const isDirectDragging = directDragNodeId === node.id;
              return (
                <div
                  key={node.id}
                  style={{
                    pointerEvents: isDirectDragging || isEditing || !isSelected ? "auto" : "none",
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    handleNodePointerDown(node.id, e);
                  }}
                >
                  <NodeWrapper
                    node={node}
                    selected={isSelected}
                    editing={isEditing}
                    onContentChange={handleContentChange}
                    onEditEnd={handleEditEnd}
                    symbolDef={symbolDef}
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
                      left: instance.x,
                      top: instance.y + instance.height + 8,
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

      {/* Floating toolbar */}
      <FloatingShapeToolbar />
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
