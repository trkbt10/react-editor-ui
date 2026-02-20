/**
 * @file StrokeSettingsPanel demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoRow,
  DemoStateDisplay,
} from "../../components";
import { StrokeSettingsPanel } from "../../../panels/StrokeSettingsPanel/StrokeSettingsPanel";
import { PanelFrame } from "../../../components/PanelFrame/PanelFrame";
import {
  StrokePanelExpanded,
  createDefaultExpandedSettings,
} from "../../../panels/StrokeSettingsPanel/StrokePanelExpanded";
import {
  StrokePanelCompact,
  createDefaultCompactSettings,
} from "../../../panels/StrokeSettingsPanel/StrokePanelCompact";
import type { StrokeSettings } from "../../../panels/StrokeSettingsPanel/StrokeSettingsPanel";
import type { StrokePanelExpandedSettings } from "../../../panels/StrokeSettingsPanel/StrokePanelExpanded";
import type { StrokePanelCompactSettings } from "../../../panels/StrokeSettingsPanel/StrokePanelCompact";

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
    <DemoContainer title="StrokeSettingsPanel">
      <DemoRow>
        <DemoSection label="Expanded (all options visible)">
          <PanelFrame title="Stroke" onClose={() => alert("Close")} width={340}>
            <StrokePanelExpanded
              settings={expandedSettings}
              onChange={setExpandedSettings}
            />
          </PanelFrame>
        </DemoSection>

        <DemoSection label="Compact (tabbed interface)">
          <PanelFrame title="Stroke Settings" onClose={() => alert("Close")}>
            <StrokePanelCompact
              settings={compactSettings}
              onChange={setCompactSettings}
            />
          </PanelFrame>
        </DemoSection>
      </DemoRow>

      <DemoSection label="Legacy Panel (backward compatible)">
        <PanelFrame title="Stroke settings" onClose={() => alert("Close")}>
          <StrokeSettingsPanel
            settings={legacySettings}
            onChange={setLegacySettings}
          />
        </PanelFrame>
      </DemoSection>

      <DemoSection label="Expanded Settings">
        <div style={{ maxHeight: "200px", overflow: "auto" }}>
          <DemoStateDisplay value={expandedSettings} />
        </div>
      </DemoSection>
    </DemoContainer>
  );
}
