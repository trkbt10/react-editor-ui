/**
 * @file AnimationPanel demo page
 */

import { memo, useState } from "react";
import type { CSSProperties } from "react";
import {
  DemoContainer,
  DemoSection,
  DemoRow,
  DemoStateDisplay,
} from "../../components";
import { AnimationPanel } from "../../../panels/AnimationPanel/AnimationPanel";
import { PanelFrame } from "../../../components/PanelFrame/PanelFrame";
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

// Static styles to avoid recreation
const cssOutputStyle: CSSProperties = {
  marginTop: 12,
  fontFamily: "monospace",
  fontSize: 12,
};

const standaloneContainerStyle: CSSProperties = {
  display: "flex",
  gap: 24,
  alignItems: "flex-start",
};

const controlPointsLabelStyle: CSSProperties = {
  marginBottom: 8,
  fontSize: 12,
  color: "#6b7280",
};

const controlPointsCssStyle: CSSProperties = {
  marginTop: 8,
  fontFamily: "monospace",
  fontSize: 12,
};

// Stable no-op handler for disabled/static components
const noop = () => {};

// Stable close handler
const handleClose = () => alert("Close clicked");

/** Memoized section for the main AnimationPanel */
const AnimationPanelSection = memo(function AnimationPanelSection({
  settings,
  onChange,
}: {
  settings: AnimationSettings;
  onChange: (settings: AnimationSettings) => void;
}) {
  return (
    <DemoRow>
      <DemoSection label="Full Panel">
        <PanelFrame title="Animation" onClose={handleClose}>
          <AnimationPanel
            settings={settings}
            onChange={onChange}
          />
        </PanelFrame>
      </DemoSection>

      <DemoSection label="Current Settings">
        <DemoStateDisplay value={settings} />
        <div style={cssOutputStyle}>
          CSS: {toCubicBezierCss(settings.bezierControlPoints)}
        </div>
      </DemoSection>
    </DemoRow>
  );
});

/** Memoized section for standalone BezierCurveEditor */
const StandaloneBezierSection = memo(function StandaloneBezierSection({
  points,
  onChange,
}: {
  points: BezierControlPoints;
  onChange: (points: BezierControlPoints) => void;
}) {
  return (
    <DemoSection label="BezierCurveEditor (Standalone)">
      <div style={standaloneContainerStyle}>
        <BezierCurveEditor
          value={points}
          onChange={onChange}
          width={250}
          height={180}
          aria-label="Standalone bezier editor"
        />
        <div>
          <div style={controlPointsLabelStyle}>
            Control Points:
          </div>
          <DemoStateDisplay value={points} />
          <div style={controlPointsCssStyle}>
            {toCubicBezierCss(points)}
          </div>
        </div>
      </div>
    </DemoSection>
  );
});

/** Memoized static sections that never change */
const StaticSections = memo(function StaticSections() {
  return (
    <>
      <DemoSection label="Disabled State">
        <BezierCurveEditor
          value={EASING_PRESETS["ease-in-out"]}
          onChange={noop}
          disabled
          width={200}
          height={150}
          aria-label="Disabled bezier editor"
        />
      </DemoSection>

      <DemoSection label="Without Grid">
        <BezierCurveEditor
          value={EASING_PRESETS["ease-out"]}
          onChange={noop}
          showGrid={false}
          width={200}
          height={150}
          aria-label="Bezier editor without grid"
        />
      </DemoSection>
    </>
  );
});

export function AnimationPanelDemo() {
  const [settings, setSettings] = useState<AnimationSettings>(
    createDefaultAnimationSettings()
  );

  const [standalonePoints, setStandalonePoints] = useState<BezierControlPoints>(
    EASING_PRESETS.ease
  );

  // useCallback is not needed here since setSettings/setStandalonePoints are already stable
  // But we wrap to ensure the reference is obvious

  return (
    <DemoContainer title="AnimationPanel">
      <AnimationPanelSection settings={settings} onChange={setSettings} />
      <StandaloneBezierSection points={standalonePoints} onChange={setStandalonePoints} />
      <StaticSections />
    </DemoContainer>
  );
}
