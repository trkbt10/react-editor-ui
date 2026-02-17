/**
 * @file ShapesAndLayersPanel - Split panel with shapes search at top and layers at bottom
 */

import { memo, useState, useCallback, useRef, type CSSProperties } from "react";
import { ResizeHandle } from "react-panel-layout";

import { ShapeLibrary } from "./ShapeLibrary";
import { LayersPanel } from "./LayersPanel";

// =============================================================================
// Constants
// =============================================================================

const MIN_SECTION_HEIGHT = 100;
const DEFAULT_SHAPES_HEIGHT = 300;

// =============================================================================
// Styles
// =============================================================================

const containerStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--rei-color-surface)",
  borderRight: "1px solid var(--rei-color-border)",
  overflow: "hidden",
};

const sectionStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  minHeight: MIN_SECTION_HEIGHT,
};

const dividerHandleStyle: CSSProperties = {
  width: 32,
  height: 2,
  borderRadius: 1,
  backgroundColor: "var(--rei-color-text-muted)",
  opacity: 0.5,
};

const dividerInnerStyle: CSSProperties = {
  height: 6,
  flexShrink: 0,
  backgroundColor: "var(--rei-color-surface)",
  borderTop: "1px solid var(--rei-color-border)",
  borderBottom: "1px solid var(--rei-color-border)",
  cursor: "row-resize",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

// =============================================================================
// Component
// =============================================================================

export const ShapesAndLayersPanel = memo(function ShapesAndLayersPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shapesHeight, setShapesHeight] = useState(DEFAULT_SHAPES_HEIGHT);

  const handleResize = useCallback(
    (delta: number) => {
      if (!containerRef.current) {
        return;
      }

      const containerHeight = containerRef.current.offsetHeight;
      const dividerHeight = 6;
      const maxHeight = containerHeight - dividerHeight - MIN_SECTION_HEIGHT;

      setShapesHeight((prev) => {
        const newHeight = prev + delta;
        return Math.max(MIN_SECTION_HEIGHT, Math.min(maxHeight, newHeight));
      });
    },
    [],
  );

  const shapesSectionStyle: CSSProperties = {
    ...sectionStyle,
    height: shapesHeight,
    flexShrink: 0,
  };

  const layersSectionStyle: CSSProperties = {
    ...sectionStyle,
    flex: 1,
    minHeight: 0,
  };

  return (
    <div ref={containerRef} style={containerStyle} data-testid="left-panel">
      <div style={shapesSectionStyle} data-testid="shapes-section">
        <ShapeLibrary />
      </div>
      <ResizeHandle
        direction="vertical"
        onResize={handleResize}
        element={
          <div style={dividerInnerStyle} data-testid="panel-divider">
            <div style={dividerHandleStyle} />
          </div>
        }
      />
      <div style={layersSectionStyle} data-testid="layers-section">
        <LayersPanel />
      </div>
    </div>
  );
});
