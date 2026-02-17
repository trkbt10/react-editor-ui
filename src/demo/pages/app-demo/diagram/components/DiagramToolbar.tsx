/**
 * @file DiagramToolbar - Top toolbar with export and grid controls
 */

import { memo, useContext, useCallback, useState, useMemo, type CSSProperties } from "react";
import {
  LuDownload,
  LuGrid3X3,
  LuMagnet,
  LuZoomIn,
  LuZoomOut,
  LuMousePointer2,
  LuSpline,
  LuUndo,
  LuRedo,
} from "react-icons/lu";

import { Toolbar } from "../../../../../components/Toolbar/Toolbar";
import { ToolbarGroup } from "../../../../../components/Toolbar/ToolbarGroup";
import { ToolbarDivider } from "../../../../../components/Toolbar/ToolbarDivider";
import { IconButton } from "../../../../../components/IconButton/IconButton";
import { Button } from "../../../../../components/Button/Button";
import { Tooltip } from "../../../../../components/Tooltip/Tooltip";
import { Select, type SelectOption } from "../../../../../components/Select/Select";

import { SegmentedControl, type SegmentedControlOption } from "../../../../../components/SegmentedControl/SegmentedControl";

import { DocumentContext, GridContext, ToolContext, ViewportContext, PageContext } from "../contexts";
import type { ExportFormat, PageId } from "../types";
import { exportToSVG } from "../export/exportToSVG";
import { exportToPNG } from "../export/exportToPNG";
import { exportToMermaid } from "../export/exportToMermaid";
import { exportToMarkdown } from "../export/exportToMarkdown";

// =============================================================================
// Styles
// =============================================================================

const toolbarContainerStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  backgroundColor: "var(--rei-color-surface)",
  borderBottom: "1px solid var(--rei-color-border)",
  gap: 8,
};

const titleStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "var(--rei-color-text)",
  marginRight: 16,
};

const spacerStyle: CSSProperties = {
  flex: 1,
};

const zoomDisplayStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--rei-color-text-muted)",
  minWidth: 48,
  textAlign: "center",
};

// =============================================================================
// Export Options
// =============================================================================

const exportOptions: SelectOption<ExportFormat>[] = [
  { value: "svg", label: "SVG" },
  { value: "png", label: "PNG" },
  { value: "mermaid", label: "Mermaid" },
  { value: "markdown", label: "Markdown" },
];

const pageOptions: SegmentedControlOption<PageId>[] = [
  { value: "canvas", label: "Canvas" },
  { value: "symbols", label: "Symbols" },
];

// =============================================================================
// Component
// =============================================================================

export const DiagramToolbar = memo(function DiagramToolbar() {
  const documentCtx = useContext(DocumentContext);
  const gridCtx = useContext(GridContext);
  const toolCtx = useContext(ToolContext);
  const viewportCtx = useContext(ViewportContext);
  const pageCtx = useContext(PageContext);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("svg");

  if (!documentCtx || !gridCtx || !toolCtx || !viewportCtx || !pageCtx) {
    return null;
  }

  const { document } = documentCtx;
  const { gridEnabled, snapToGrid, toggleGrid, toggleSnap } = gridCtx;
  const { activeTool, setActiveTool } = toolCtx;
  const { zoom, setZoom } = viewportCtx;
  const { activePageId, setActivePageId } = pageCtx;

  const handleExport = useCallback(async () => {
    switch (exportFormat) {
      case "svg": {
        const svg = exportToSVG(document);
        downloadFile(svg, "diagram.svg", "image/svg+xml");
        break;
      }
      case "png": {
        const blob = await exportToPNG(document);
        downloadBlob(blob, "diagram.png");
        break;
      }
      case "mermaid": {
        const mermaid = exportToMermaid(document);
        downloadFile(mermaid, "diagram.mmd", "text/plain");
        break;
      }
      case "markdown": {
        const markdown = await exportToMarkdown(document);
        downloadFile(markdown, "diagram.md", "text/markdown");
        break;
      }
    }
  }, [document, exportFormat]);

  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(zoom + 25, 400));
  }, [zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(zoom - 25, 25));
  }, [zoom, setZoom]);

  const toolHandlers = useMemo(() => ({
    select: () => setActiveTool("select"),
    connection: () => setActiveTool("connection"),
  }), [setActiveTool]);

  const handlePageChange = useCallback((value: PageId | PageId[]) => {
    // SegmentedControl always returns single value when not multiSelect
    const pageId = Array.isArray(value) ? value[0] : value;
    if (pageId) {
      setActivePageId(pageId);
    }
  }, [setActivePageId]);

  return (
    <div style={toolbarContainerStyle}>
      <span style={titleStyle}>Diagram Editor</span>

      {/* Page switcher */}
      <SegmentedControl
        options={pageOptions}
        value={activePageId}
        onChange={handlePageChange}
        size="sm"
      />

      <ToolbarDivider />

      <Toolbar variant="default" orientation="horizontal" fitContent>
        <ToolbarGroup>
          <Tooltip content="Select (V)" placement="bottom">
            <IconButton
              icon={<LuMousePointer2 size={16} />}
              aria-label="Select tool"
              size="sm"
              variant={activeTool === "select" ? "selected" : "default"}
              onClick={toolHandlers.select}
            />
          </Tooltip>
          <Tooltip content="Connection (C)" placement="bottom">
            <IconButton
              icon={<LuSpline size={16} />}
              aria-label="Connection tool"
              size="sm"
              variant={activeTool === "connection" ? "selected" : "default"}
              onClick={toolHandlers.connection}
            />
          </Tooltip>
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <Tooltip content="Undo" placement="bottom">
            <IconButton
              icon={<LuUndo size={16} />}
              aria-label="Undo"
              size="sm"
              disabled
            />
          </Tooltip>
          <Tooltip content="Redo" placement="bottom">
            <IconButton
              icon={<LuRedo size={16} />}
              aria-label="Redo"
              size="sm"
              disabled
            />
          </Tooltip>
        </ToolbarGroup>
        <ToolbarDivider />
        <ToolbarGroup>
          <Tooltip content={gridEnabled ? "Hide Grid" : "Show Grid"} placement="bottom">
            <IconButton
              icon={<LuGrid3X3 size={16} />}
              aria-label="Toggle grid"
              size="sm"
              variant={gridEnabled ? "selected" : "default"}
              onClick={toggleGrid}
            />
          </Tooltip>
          <Tooltip content={snapToGrid ? "Disable Snap" : "Enable Snap"} placement="bottom">
            <IconButton
              icon={<LuMagnet size={16} />}
              aria-label="Toggle snap to grid"
              size="sm"
              variant={snapToGrid ? "selected" : "default"}
              onClick={toggleSnap}
            />
          </Tooltip>
        </ToolbarGroup>
      </Toolbar>

      <div style={spacerStyle} />

      {/* Zoom controls */}
      <Toolbar variant="default" orientation="horizontal" fitContent>
        <ToolbarGroup>
          <Tooltip content="Zoom Out" placement="bottom">
            <IconButton
              icon={<LuZoomOut size={16} />}
              aria-label="Zoom out"
              size="sm"
              onClick={handleZoomOut}
            />
          </Tooltip>
          <span style={zoomDisplayStyle}>{zoom}%</span>
          <Tooltip content="Zoom In" placement="bottom">
            <IconButton
              icon={<LuZoomIn size={16} />}
              aria-label="Zoom in"
              size="sm"
              onClick={handleZoomIn}
            />
          </Tooltip>
        </ToolbarGroup>
      </Toolbar>

      <ToolbarDivider />

      {/* Export controls */}
      <div style={{ width: 100 }}>
        <Select
          options={exportOptions}
          value={exportFormat}
          onChange={setExportFormat}
          size="sm"
          aria-label="Export format"
        />
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={handleExport}
      >
        <LuDownload size={14} />
        Export
      </Button>
    </div>
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
