/**
 * @file StrokeDynamicTab - Dynamic stroke settings tab content
 */

import { memo } from "react";
import type { CSSProperties } from "react";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { SPACE_SM } from "../../constants/styles";
import { FrequencyIcon, WiggleIcon, SmoothIcon } from "../../icons";
import { StrokePropertyRow } from "./StrokePropertyRow";

export type StrokeDynamicTabProps = {
  frequency: string;
  wiggle: string;
  smoothen: string;
  onFrequencyChange: (value: string) => void;
  onWiggleChange: (value: string) => void;
  onSmoothenChange: (value: string) => void;
};

const percentUnits = [{ value: "%", label: "%" }];

const flexOneStyle: CSSProperties = { flex: 1 };

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

/**
 * Dynamic stroke settings tab with frequency, wiggle, and smoothen.
 */
export const StrokeDynamicTab = memo(function StrokeDynamicTab({
  frequency,
  wiggle,
  smoothen,
  onFrequencyChange,
  onWiggleChange,
  onSmoothenChange,
}: StrokeDynamicTabProps) {
  return (
    <div style={containerStyle}>
      <StrokePropertyRow label="Frequency">
        <div style={flexOneStyle}>
          <UnitInput
            value={frequency}
            onChange={onFrequencyChange}
            units={percentUnits}
            iconStart={<FrequencyIcon />}
            min={0}
            max={100}
            step={1}
            aria-label="Frequency"
          />
        </div>
      </StrokePropertyRow>

      <StrokePropertyRow label="Wiggle">
        <div style={flexOneStyle}>
          <UnitInput
            value={wiggle}
            onChange={onWiggleChange}
            units={percentUnits}
            iconStart={<WiggleIcon />}
            min={0}
            max={100}
            step={1}
            aria-label="Wiggle"
          />
        </div>
      </StrokePropertyRow>

      <StrokePropertyRow label="Smoothen">
        <div style={flexOneStyle}>
          <UnitInput
            value={smoothen}
            onChange={onSmoothenChange}
            units={percentUnits}
            iconStart={<SmoothIcon />}
            min={0}
            max={100}
            step={1}
            aria-label="Smoothen"
          />
        </div>
      </StrokePropertyRow>
    </div>
  );
});
