/**
 * @file ShapesAndLayersPanel - Combined panel with tabs for Shapes and Layers
 */

import { memo, useState, type CSSProperties } from "react";

import { TabBar } from "../../../../../components/TabBar/TabBar";
import { ShapeLibrary } from "./ShapeLibrary";
import { LayersPanel } from "./LayersPanel";

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

const tabBarContainerStyle: CSSProperties = {
  padding: "8px 12px",
  borderBottom: "1px solid var(--rei-color-border)",
};

const contentStyle: CSSProperties = {
  flex: 1,
  overflow: "hidden",
};

// =============================================================================
// Component
// =============================================================================

type PanelTab = "shapes" | "layers";

const tabs = [
  { id: "shapes" as const, label: "Shapes" },
  { id: "layers" as const, label: "Layers" },
];

export const ShapesAndLayersPanel = memo(function ShapesAndLayersPanel() {
  const [activeTab, setActiveTab] = useState<PanelTab>("shapes");

  return (
    <div style={containerStyle}>
      <div style={tabBarContainerStyle}>
        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as PanelTab)}
          size="sm"
        />
      </div>
      <div style={contentStyle}>
        {activeTab === "shapes" ? <ShapeLibrary /> : <LayersPanel />}
      </div>
    </div>
  );
});
