/**
 * @file AnimationPanel demo page
 */

import { useState } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoRow,
  DemoStateDisplay,
} from "../../components";
import { AnimationPanel } from "../../../panels/AnimationPanel";
import { BezierCurveEditor } from "../../../components/BezierCurveEditor/BezierCurveEditor";
import {
  EASING_PRESETS,
  createDefaultAnimationSettings,
  toCubicBezierCss,
} from "../../../components/BezierCurveEditor/bezierPresets";
import type {
  AnimationSettings,
  BezierControlPoints,
} from "../../../components/BezierCurveEditor/bezierTypes";

export function AnimationPanelDemo() {
  const [settings, setSettings] = useState<AnimationSettings>(
    createDefaultAnimationSettings()
  );

  const [standalonePoints, setStandalonePoints] = useState<BezierControlPoints>(
    EASING_PRESETS.ease
  );

  return (
    <DemoContainer title="AnimationPanel">
      <DemoRow>
        <DemoSection label="Full Panel">
          <AnimationPanel
            settings={settings}
            onChange={setSettings}
            onClose={() => alert("Close clicked")}
          />
        </DemoSection>

        <DemoSection label="Current Settings">
          <DemoStateDisplay value={settings} />
          <div style={{ marginTop: 12, fontFamily: "monospace", fontSize: 12 }}>
            CSS: {toCubicBezierCss(settings.bezierControlPoints)}
          </div>
        </DemoSection>
      </DemoRow>

      <DemoSection label="BezierCurveEditor (Standalone)">
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          <BezierCurveEditor
            value={standalonePoints}
            onChange={setStandalonePoints}
            width={250}
            height={180}
            aria-label="Standalone bezier editor"
          />
          <div>
            <div style={{ marginBottom: 8, fontSize: 12, color: "#6b7280" }}>
              Control Points:
            </div>
            <DemoStateDisplay value={standalonePoints} />
            <div style={{ marginTop: 8, fontFamily: "monospace", fontSize: 12 }}>
              {toCubicBezierCss(standalonePoints)}
            </div>
          </div>
        </div>
      </DemoSection>

      <DemoSection label="Disabled State">
        <BezierCurveEditor
          value={EASING_PRESETS["ease-in-out"]}
          onChange={() => {}}
          disabled
          width={200}
          height={150}
          aria-label="Disabled bezier editor"
        />
      </DemoSection>

      <DemoSection label="Without Grid">
        <BezierCurveEditor
          value={EASING_PRESETS["ease-out"]}
          onChange={() => {}}
          showGrid={false}
          width={200}
          height={150}
          aria-label="Bezier editor without grid"
        />
      </DemoSection>
    </DemoContainer>
  );
}
