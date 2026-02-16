/**
 * @file PositionPanel demo page
 */

import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import {
  PositionPanel,
  createDefaultPositionSettings,
} from "../../../components/PositionPanel/PositionPanel";
import type { PositionSettings } from "../../../components/PositionPanel/PositionPanel";

export function PositionPanelDemo() {
  const [settings, setSettings] = useState<PositionSettings>(createDefaultPositionSettings());

  const handleTransformAction = (action: string) => {
    console.log("Transform action:", action);
  };

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>PositionPanel</h2>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Complete Panel</div>
        <PositionPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => alert("Close clicked")}
          onToggleConstraints={() => alert("Toggle constraints")}
          onTransformAction={handleTransformAction}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Current Settings</div>
        <div style={{
          backgroundColor: "var(--rei-color-surface, #1e1f24)",
          borderRadius: "4px",
          padding: "12px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "var(--rei-color-text-muted)",
          whiteSpace: "pre-wrap",
        }}>
          {JSON.stringify(settings, null, 2)}
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Without Close Button</div>
        <PositionPanel
          settings={{
            ...settings,
            x: "100",
            y: "200",
            rotation: "45",
          }}
          onChange={setSettings}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Custom Width</div>
        <PositionPanel
          settings={settings}
          onChange={setSettings}
          width={400}
        />
      </div>
    </div>
  );
}
