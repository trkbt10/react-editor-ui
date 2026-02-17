/**
 * @file Diagram Editor contexts (Split Context pattern for performance)
 */

import { createContext } from "react";
import type { DiagramDocument, DiagramPage, CanvasPage, SymbolsPage, PageId, ToolType } from "./types";

// =============================================================================
// Document Context
// =============================================================================

export type DocumentContextValue = {
  document: DiagramDocument;
  setDocument: React.Dispatch<React.SetStateAction<DiagramDocument>>;
};

export const DocumentContext = createContext<DocumentContextValue | null>(null);

// =============================================================================
// Selection Context
// =============================================================================

export type SelectionContextValue = {
  selectedNodeIds: Set<string>;
  selectedConnectionIds: Set<string>;
  setSelectedNodeIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  setSelectedConnectionIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  clearSelection: () => void;
};

export const SelectionContext = createContext<SelectionContextValue | null>(null);

// =============================================================================
// Tool Context
// =============================================================================

export type ToolContextValue = {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
};

export const ToolContext = createContext<ToolContextValue | null>(null);

// =============================================================================
// Grid Context
// =============================================================================

export type GridContextValue = {
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  toggleGrid: () => void;
  toggleSnap: () => void;
};

export const GridContext = createContext<GridContextValue | null>(null);

// =============================================================================
// Viewport Context
// =============================================================================

export type ViewportContextValue = {
  zoom: number;
  setZoom: (zoom: number) => void;
};

export const ViewportContext = createContext<ViewportContextValue | null>(null);

// =============================================================================
// Page Context
// =============================================================================

export type PageContextValue = {
  /** Currently active page ID */
  activePageId: PageId;
  /** Set the active page */
  setActivePageId: (pageId: PageId) => void;
  /** Get the active page data (canvas or symbols) */
  activePage: DiagramPage;
  /** Get the canvas page */
  canvasPage: CanvasPage;
  /** Get the symbols page (for resolving symbol instances) */
  symbolsPage: SymbolsPage;
};

export const PageContext = createContext<PageContextValue | null>(null);

// =============================================================================
// History Context
// =============================================================================

export type HistoryContextValue = {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

export const HistoryContext = createContext<HistoryContextValue | null>(null);
