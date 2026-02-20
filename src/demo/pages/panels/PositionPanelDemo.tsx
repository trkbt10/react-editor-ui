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
import type { PositionSettings } from "../../../panels/PositionPanel/PositionPanel";

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
          onToggleConstraints={() => alert("Toggle constraints")}
          onTransformAction={handleTransformAction}
        />
      </DemoSection>

      <DemoSection label="Current Settings">
        <DemoStateDisplay value={settings} />
      </DemoSection>
    </DemoContainer>
  );
}
