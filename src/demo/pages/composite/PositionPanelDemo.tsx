/**
 * @file PositionPanel demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoStateDisplay,
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
    <DemoContainer title="PositionPanel">
      <DemoSection label="Complete Panel">
        <PositionPanel
          settings={settings}
          onChange={setSettings}
          onClose={() => alert("Close clicked")}
          onToggleConstraints={() => alert("Toggle constraints")}
          onTransformAction={handleTransformAction}
        />
      </DemoSection>

      <DemoSection label="Current Settings">
        <DemoStateDisplay value={settings} />
      </DemoSection>

      <DemoSection label="Without Close Button">
        <PositionPanel
          settings={{
            ...settings,
            x: "100",
            y: "200",
            rotation: "45",
          }}
          onChange={setSettings}
        />
      </DemoSection>

      <DemoSection label="Custom Width">
        <PositionPanel
          settings={settings}
          onChange={setSettings}
          width={400}
        />
      </DemoSection>
    </DemoContainer>
  );
}
