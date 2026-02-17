/**
 * @file DiagramDemo - Draw.io style diagram editor
 */

import { useState, useMemo, useCallback, useEffect, type CSSProperties } from "react";
import {
  GridLayout,
  type PanelLayoutConfig,
  type LayerDefinition,
} from "react-panel-layout";

import { useHistory } from "../../../../hooks/useHistory";
import {
  DocumentContext,
  SelectionContext,
  ToolContext,
  GridContext,
  ViewportContext,
  PageContext,
  HistoryContext,
  type DocumentContextValue,
  type SelectionContextValue,
  type ToolContextValue,
  type GridContextValue,
  type ViewportContextValue,
  type PageContextValue,
  type HistoryContextValue,
} from "./contexts";
import type { DiagramDocument, ToolType, PageId } from "./types";
import { initialDocument } from "./mockData";

import { DiagramToolbar } from "./components/DiagramToolbar";
import { DiagramCanvas } from "./components/DiagramCanvas";
import { ShapesAndLayersPanel } from "./components/ShapesAndLayersPanel";
import { DiagramInspector } from "./components/DiagramInspector";

// =============================================================================
// Layout Configuration
// =============================================================================

const layoutConfig: PanelLayoutConfig = {
  areas: [
    ["toolbar", "toolbar", "toolbar"],
    ["shapes", "canvas", "inspector"],
  ],
  columns: [
    { size: "240px", resizable: true, minSize: 200, maxSize: 320 },
    { size: "1fr" },
    { size: "280px", resizable: true, minSize: 240, maxSize: 400 },
  ],
  rows: [
    { size: "48px" },
    { size: "1fr" },
  ],
};

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  height: "100vh",
  width: "100%",
  overflow: "hidden",
};

// =============================================================================
// History Metadata
// =============================================================================

type HistoryMetadata = {
  selectedNodeIds: string[];
  selectedConnectionIds: string[];
};

// =============================================================================
// Main Component
// =============================================================================

export function DiagramDemo() {
  // Document state with history
  const history = useHistory<DiagramDocument, HistoryMetadata>(initialDocument, {
    debounceMs: 500,
    maxHistory: 50,
  });
  const document = history.state;

  // Wrap setDocument to push to history
  const setDocument = useCallback(
    (updater: React.SetStateAction<DiagramDocument>) => {
      const newDoc = typeof updater === "function" ? updater(history.state) : updater;
      history.push(newDoc);
    },
    [history],
  );

  // Selection state
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<Set<string>>(new Set());

  // Tool state
  const [activeTool, setActiveTool] = useState<ToolType>("select");

  // Grid state
  const [gridEnabled, setGridEnabled] = useState(true);
  const [snapEnabled, setSnapEnabled] = useState(true);

  // Viewport state
  const [zoom, setZoom] = useState(100);

  // Page state
  const [activePageId, setActivePageId] = useState<PageId>(document.activePageId);

  // Get active page based on activePageId
  const activePage = useMemo(
    () => activePageId === "canvas" ? document.canvasPage : document.symbolsPage,
    [activePageId, document.canvasPage, document.symbolsPage],
  );

  // Selection handlers
  const clearSelection = useCallback(() => {
    setSelectedNodeIds(new Set());
    setSelectedConnectionIds(new Set());
  }, []);

  // Grid handlers
  const toggleGrid = useCallback(() => {
    setGridEnabled((prev) => !prev);
  }, []);

  const toggleSnap = useCallback(() => {
    setSnapEnabled((prev) => !prev);
  }, []);

  // History handlers
  const handleUndo = useCallback(() => {
    const entry = history.undo();
    if (entry?.metadata) {
      setSelectedNodeIds(new Set(entry.metadata.selectedNodeIds));
      setSelectedConnectionIds(new Set(entry.metadata.selectedConnectionIds));
    }
  }, [history]);

  const handleRedo = useCallback(() => {
    const entry = history.redo();
    if (entry?.metadata) {
      setSelectedNodeIds(new Set(entry.metadata.selectedNodeIds));
      setSelectedConnectionIds(new Set(entry.metadata.selectedConnectionIds));
    }
  }, [history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Z or Ctrl+Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Cmd+Shift+Z or Ctrl+Shift+Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
      // Cmd+Y or Ctrl+Y for redo (alternative)
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Context values (memoized)
  const documentValue = useMemo<DocumentContextValue>(
    () => ({ document, setDocument }),
    [document, setDocument],
  );

  const selectionValue = useMemo<SelectionContextValue>(
    () => ({
      selectedNodeIds,
      selectedConnectionIds,
      setSelectedNodeIds,
      setSelectedConnectionIds,
      clearSelection,
    }),
    [selectedNodeIds, selectedConnectionIds, clearSelection],
  );

  const toolValue = useMemo<ToolContextValue>(
    () => ({ activeTool, setActiveTool }),
    [activeTool],
  );

  const gridValue = useMemo<GridContextValue>(
    () => ({
      gridEnabled,
      snapToGrid: snapEnabled,
      gridSize: document.gridSize,
      toggleGrid,
      toggleSnap,
    }),
    [gridEnabled, snapEnabled, document.gridSize, toggleGrid, toggleSnap],
  );

  const viewportValue = useMemo<ViewportContextValue>(
    () => ({ zoom, setZoom }),
    [zoom],
  );

  const pageValue = useMemo<PageContextValue>(
    () => ({
      activePageId,
      setActivePageId,
      activePage,
      canvasPage: document.canvasPage,
      symbolsPage: document.symbolsPage,
    }),
    [activePageId, activePage, document.canvasPage, document.symbolsPage],
  );

  const historyValue = useMemo<HistoryContextValue>(
    () => ({
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      undo: handleUndo,
      redo: handleRedo,
    }),
    [history.canUndo, history.canRedo, handleUndo, handleRedo],
  );

  // Layers
  const layers = useMemo<LayerDefinition[]>(
    () => [
      { id: "toolbar", gridArea: "toolbar", component: <DiagramToolbar /> },
      { id: "shapes", gridArea: "shapes", component: <ShapesAndLayersPanel /> },
      { id: "canvas", gridArea: "canvas", component: <DiagramCanvas /> },
      { id: "inspector", gridArea: "inspector", component: <DiagramInspector /> },
    ],
    [],
  );

  return (
    <DocumentContext.Provider value={documentValue}>
      <PageContext.Provider value={pageValue}>
        <SelectionContext.Provider value={selectionValue}>
          <ToolContext.Provider value={toolValue}>
            <GridContext.Provider value={gridValue}>
              <ViewportContext.Provider value={viewportValue}>
                <HistoryContext.Provider value={historyValue}>
                  <div style={containerStyle}>
                    <GridLayout config={layoutConfig} layers={layers} />
                  </div>
                </HistoryContext.Provider>
              </ViewportContext.Provider>
            </GridContext.Provider>
          </ToolContext.Provider>
        </SelectionContext.Provider>
      </PageContext.Provider>
    </DocumentContext.Provider>
  );
}
