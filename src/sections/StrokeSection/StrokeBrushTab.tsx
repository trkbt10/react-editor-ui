/**
 * @file StrokeBrushTab - Brush stroke settings tab content
 */

import { memo } from "react";
import type { CSSProperties } from "react";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { Select, type SelectOption } from "../../components/Select/Select";
import { IconButton } from "../../components/IconButton/IconButton";
import type { WidthProfile } from "../../components/StrokeWidthProfileSelect/StrokeWidthProfileSelect";
import { SPACE_SM } from "../../themes/styles";
import { FlipHorizontalIcon, ChevronLeftIcon, ChevronRightIcon } from "../../icons";
import { StrokePropertyRow } from "./StrokePropertyRow";
import { WidthProfilePreview, BrushPreview } from "./StrokePreviews";
import type { BrushType, BrushDirection } from "./types";

export type StrokeBrushTabProps = {
  brushType: BrushType;
  brushDirection: BrushDirection;
  brushWidthProfile: WidthProfile;
  onBrushTypeChange: (value: BrushType) => void;
  onBrushDirectionChange: (value: BrushDirection | BrushDirection[]) => void;
  onBrushWidthProfileChange: (value: WidthProfile) => void;
};

const brushOptions: SelectOption<BrushType>[] = [
  { value: "smooth", preview: <BrushPreview type="smooth" /> },
  { value: "rough", preview: <BrushPreview type="rough" /> },
  { value: "spray", preview: <BrushPreview type="spray" /> },
];

const widthProfileOptions: SelectOption<WidthProfile>[] = [
  { value: "uniform", preview: <WidthProfilePreview variant="uniform" /> },
  { value: "taper-end", preview: <WidthProfilePreview variant="taper-end" /> },
  { value: "taper-both", preview: <WidthProfilePreview variant="taper-both" /> },
];

const directionOptions = [
  { value: "left" as const, icon: <ChevronLeftIcon size={18} />, "aria-label": "Left direction" },
  { value: "right" as const, icon: <ChevronRightIcon size={18} />, "aria-label": "Right direction" },
];

const flexOneStyle: CSSProperties = { flex: 1 };

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

/**
 * Brush stroke settings tab with brush type, direction, and width profile.
 */
export const StrokeBrushTab = memo(function StrokeBrushTab({
  brushType,
  brushDirection,
  brushWidthProfile,
  onBrushTypeChange,
  onBrushDirectionChange,
  onBrushWidthProfileChange,
}: StrokeBrushTabProps) {
  return (
    <div style={containerStyle}>
      <div>
        <Select
          options={brushOptions}
          value={brushType}
          onChange={onBrushTypeChange}
          size="lg"
          aria-label="Brush type"
        />
      </div>

      <StrokePropertyRow label="Direction">
        <SegmentedControl
          options={directionOptions}
          value={brushDirection}
          onChange={onBrushDirectionChange}
          size="md"
          aria-label="Brush direction"
        />
      </StrokePropertyRow>

      <StrokePropertyRow label="Width profile">
        <div style={flexOneStyle}>
          <Select
            options={widthProfileOptions}
            value={brushWidthProfile}
            onChange={onBrushWidthProfileChange}
            aria-label="Brush width profile"
          />
        </div>
        <IconButton icon={<FlipHorizontalIcon size={16} />} aria-label="Flip brush width profile" size="md" />
      </StrokePropertyRow>
    </div>
  );
});
