/**
 * @file StrokeSection component - Comprehensive stroke settings
 */

import { memo, useMemo } from "react";
import type { CSSProperties } from "react";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import type { JoinType } from "../../components/StrokeJoinControl/StrokeJoinControl";
import { SPACE_SM } from "../../themes/styles";
import type { StrokeSectionProps, StrokeTab, BrushDirection } from "./types";
import { StrokeBasicTab } from "./StrokeBasicTab";
import { StrokeDynamicTab } from "./StrokeDynamicTab";
import { StrokeBrushTab } from "./StrokeBrushTab";

const tabOptions = [
  { value: "basic" as const, label: "Basic" },
  { value: "dynamic" as const, label: "Dynamic" },
  { value: "brush" as const, label: "Brush" },
];

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

/**
 * Stroke section with basic, dynamic, and brush settings.
 */
export const StrokeSection = memo(function StrokeSection({
  data,
  onChange,
  className,
}: StrokeSectionProps) {
  const handlers = useMemo(
    () => ({
      tab: (v: StrokeTab | StrokeTab[]) => {
        const tab = Array.isArray(v) ? v[0] : v;
        onChange({ ...data, tab });
      },
      // Basic tab
      style: (v: typeof data.style) => onChange({ ...data, style: v }),
      widthProfile: (v: typeof data.widthProfile) => onChange({ ...data, widthProfile: v }),
      join: (v: JoinType | JoinType[]) => {
        const join = Array.isArray(v) ? v[0] : v;
        onChange({ ...data, join });
      },
      miterAngle: (v: string) => onChange({ ...data, miterAngle: v }),
      // Dynamic tab
      frequency: (v: string) => onChange({ ...data, frequency: v }),
      wiggle: (v: string) => onChange({ ...data, wiggle: v }),
      smoothen: (v: string) => onChange({ ...data, smoothen: v }),
      // Brush tab
      brushType: (v: typeof data.brushType) => onChange({ ...data, brushType: v }),
      brushDirection: (v: BrushDirection | BrushDirection[]) => {
        const brushDirection = Array.isArray(v) ? v[0] : v;
        onChange({ ...data, brushDirection });
      },
      brushWidthProfile: (v: typeof data.brushWidthProfile) => onChange({ ...data, brushWidthProfile: v }),
    }),
    [onChange, data],
  );

  const renderTabContent = () => {
    switch (data.tab) {
      case "dynamic":
        return (
          <StrokeDynamicTab
            frequency={data.frequency}
            wiggle={data.wiggle}
            smoothen={data.smoothen}
            onFrequencyChange={handlers.frequency}
            onWiggleChange={handlers.wiggle}
            onSmoothenChange={handlers.smoothen}
          />
        );
      case "brush":
        return (
          <StrokeBrushTab
            brushType={data.brushType}
            brushDirection={data.brushDirection}
            brushWidthProfile={data.brushWidthProfile}
            onBrushTypeChange={handlers.brushType}
            onBrushDirectionChange={handlers.brushDirection}
            onBrushWidthProfileChange={handlers.brushWidthProfile}
          />
        );
      default:
        return (
          <StrokeBasicTab
            style={data.style}
            widthProfile={data.widthProfile}
            join={data.join}
            miterAngle={data.miterAngle}
            onStyleChange={handlers.style}
            onWidthProfileChange={handlers.widthProfile}
            onJoinChange={handlers.join}
            onMiterAngleChange={handlers.miterAngle}
          />
        );
    }
  };

  return (
    <div className={className} style={containerStyle}>
      <SegmentedControl
        options={tabOptions}
        value={data.tab}
        onChange={handlers.tab}
        aria-label="Stroke settings tab"
      />
      {renderTabContent()}
    </div>
  );
});
