/**
 * @file StrokeBasicTab - Basic stroke settings tab content
 */

import { memo } from "react";
import type { CSSProperties } from "react";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { Select, type SelectOption } from "../../components/Select/Select";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { IconButton } from "../../components/IconButton/IconButton";
import { SPACE_SM } from "../../themes/styles";
import {
  FlipHorizontalIcon,
  JoinMiterIcon,
  JoinRoundIcon,
  JoinBevelIcon,
  MiterAngleIcon,
} from "../../icons";
import { StrokePropertyRow } from "./StrokePropertyRow";
import { WidthProfilePreview } from "./StrokePreviews";
import type { StrokeStyle, JoinType, WidthProfile } from "./types";

export type StrokeBasicTabProps = {
  style: StrokeStyle;
  widthProfile: WidthProfile;
  join: JoinType;
  miterAngle: string;
  onStyleChange: (value: StrokeStyle) => void;
  onWidthProfileChange: (value: WidthProfile) => void;
  onJoinChange: (value: JoinType | JoinType[]) => void;
  onMiterAngleChange: (value: string) => void;
};

const styleOptions: SelectOption<StrokeStyle>[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
];

const widthProfileOptions: SelectOption<WidthProfile>[] = [
  { value: "uniform", preview: <WidthProfilePreview variant="uniform" /> },
  { value: "taper-end", preview: <WidthProfilePreview variant="taper-end" /> },
  { value: "taper-both", preview: <WidthProfilePreview variant="taper-both" /> },
];

const joinOptions = [
  { value: "miter" as const, icon: <JoinMiterIcon size={20} />, "aria-label": "Miter join" },
  { value: "round" as const, icon: <JoinRoundIcon size={20} />, "aria-label": "Round join" },
  { value: "bevel" as const, icon: <JoinBevelIcon size={20} />, "aria-label": "Bevel join" },
];

const miterAngleUnits = [{ value: "°", label: "°" }];

const flexOneStyle: CSSProperties = { flex: 1 };

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

/**
 * Basic stroke settings tab with style, width profile, join, and miter angle.
 */
export const StrokeBasicTab = memo(function StrokeBasicTab({
  style,
  widthProfile,
  join,
  miterAngle,
  onStyleChange,
  onWidthProfileChange,
  onJoinChange,
  onMiterAngleChange,
}: StrokeBasicTabProps) {
  return (
    <div style={containerStyle}>
      <StrokePropertyRow label="Style">
        <div style={flexOneStyle}>
          <Select
            options={styleOptions}
            value={style}
            onChange={onStyleChange}
            aria-label="Stroke style"
          />
        </div>
      </StrokePropertyRow>

      <StrokePropertyRow label="Width profile">
        <div style={flexOneStyle}>
          <Select
            options={widthProfileOptions}
            value={widthProfile}
            onChange={onWidthProfileChange}
            aria-label="Width profile"
          />
        </div>
        <IconButton icon={<FlipHorizontalIcon size={16} />} aria-label="Flip width profile" size="md" />
      </StrokePropertyRow>

      <StrokePropertyRow label="Join">
        <SegmentedControl
          options={joinOptions}
          value={join}
          onChange={onJoinChange}
          size="md"
          aria-label="Join type"
        />
      </StrokePropertyRow>

      <StrokePropertyRow label="Miter angle">
        <div style={flexOneStyle}>
          <UnitInput
            value={miterAngle}
            onChange={onMiterAngleChange}
            units={miterAngleUnits}
            iconStart={<MiterAngleIcon />}
            min={0}
            max={180}
            step={1}
            aria-label="Miter angle"
          />
        </div>
      </StrokePropertyRow>
    </div>
  );
});
