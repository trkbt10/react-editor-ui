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
} from "../../../panels/PositionPanel/PositionPanel";
import { PanelFrame } from "../../../components/PanelFrame/PanelFrame";
import type { PositionSettings } from "../../../panels/PositionPanel/PositionPanel";

export function PositionPanelDemo() {
  const [settings, setSettings] = useState<PositionSettings>(createDefaultPositionSettings());

  const handleTransformAction = (action: string) => {
    console.log("Transform action:", action);
  };

  return (
    <DemoContainer title="PositionPanel">
      <DemoSection label="Complete Panel">
        <PanelFrame title="Position" onClose={() => alert("Close clicked")}>
          <PositionPanel
            settings={settings}
            onChange={setSettings}
            onToggleConstraints={() => alert("Toggle constraints")}
            onTransformAction={handleTransformAction}
          />
        </PanelFrame>
      </DemoSection>

      <DemoSection label="Current Settings">
        <DemoStateDisplay value={settings} />
      </DemoSection>

      <DemoSection label="Without Close Button">
        <PanelFrame title="Position">
          <PositionPanel
            settings={{
              ...settings,
              x: "100",
              y: "200",
              rotation: "45",
            }}
            onChange={setSettings}
          />
        </PanelFrame>
      </DemoSection>

      <DemoSection label="Custom Width">
        <PanelFrame title="Position" width={400}>
          <PositionPanel
            settings={settings}
            onChange={setSettings}
          />
        </PanelFrame>
      </DemoSection>
    </DemoContainer>
  );
}
