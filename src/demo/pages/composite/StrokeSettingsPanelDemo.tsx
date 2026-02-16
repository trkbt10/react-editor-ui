/**
 * @file StrokeSettingsPanel demo page
 */

import { useState } from "react";
import {
  demoContainerStyle,
  demoSectionStyle,
  demoLabelStyle,
} from "../../components";
import { StrokeSettingsPanel } from "../../../components/StrokeSettingsPanel/StrokeSettingsPanel";
import {
  StrokePanelExpanded,
  createDefaultExpandedSettings,
} from "../../../components/StrokeSettingsPanel/StrokePanelExpanded";
import {
  StrokePanelCompact,
  createDefaultCompactSettings,
} from "../../../components/StrokeSettingsPanel/StrokePanelCompact";
import type { StrokeSettings } from "../../../components/StrokeSettingsPanel/StrokeSettingsPanel";
import type { StrokePanelExpandedSettings } from "../../../components/StrokeSettingsPanel/StrokePanelExpanded";
import type { StrokePanelCompactSettings } from "../../../components/StrokeSettingsPanel/StrokePanelCompact";

export function StrokeSettingsPanelDemo() {
  // Legacy settings
  const [legacySettings, setLegacySettings] = useState<StrokeSettings>({
    tab: "basic",
    style: "solid",
    widthProfile: "uniform",
    join: "miter",
    miterAngle: "28.96",
    frequency: "75",
    wiggle: "30",
    smoothen: "50",
    brushType: "smooth",
    brushDirection: "right",
    brushWidthProfile: "uniform",
  });

  // Expanded panel settings
  const [expandedSettings, setExpandedSettings] = useState<StrokePanelExpandedSettings>(
    createDefaultExpandedSettings(),
  );

  // Compact panel settings
  const [compactSettings, setCompactSettings] = useState<StrokePanelCompactSettings>(
    createDefaultCompactSettings(),
  );

  return (
    <div style={demoContainerStyle}>
      <h2 style={{ margin: 0, color: "var(--rei-color-text, #e4e6eb)" }}>StrokeSettingsPanel</h2>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={demoSectionStyle}>
          <div style={demoLabelStyle}>Expanded (all options visible)</div>
          <StrokePanelExpanded
            settings={expandedSettings}
            onChange={setExpandedSettings}
            onClose={() => alert("Close")}
          />
        </div>

        <div style={demoSectionStyle}>
          <div style={demoLabelStyle}>Compact (tabbed interface)</div>
          <StrokePanelCompact
            settings={compactSettings}
            onChange={setCompactSettings}
            onClose={() => alert("Close")}
          />
        </div>
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Legacy Panel (backward compatible)</div>
        <StrokeSettingsPanel
          settings={legacySettings}
          onChange={setLegacySettings}
          onClose={() => alert("Close")}
        />
      </div>

      <div style={demoSectionStyle}>
        <div style={demoLabelStyle}>Expanded Settings</div>
        <div style={{
          backgroundColor: "var(--rei-color-surface, #1e1f24)",
          borderRadius: "4px",
          padding: "12px",
          fontSize: "11px",
          fontFamily: "monospace",
          color: "var(--rei-color-text-muted)",
          whiteSpace: "pre-wrap",
          maxHeight: "200px",
          overflow: "auto",
        }}>
          {JSON.stringify(expandedSettings, null, 2)}
        </div>
      </div>
    </div>
  );
}
