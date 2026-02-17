/**
 * @file StrokeBasicTab - Basic stroke settings tab content
 */

import { memo } from "react";
import type { CSSProperties } from "react";
import { IconButton } from "../../components/IconButton/IconButton";
import { StrokeStyleSelect, type StrokeStyle } from "../../components/StrokeStyleSelect/StrokeStyleSelect";
import { StrokeJoinControl, type JoinType } from "../../components/StrokeJoinControl/StrokeJoinControl";
import { StrokeWidthProfileSelect, type WidthProfile } from "../../components/StrokeWidthProfileSelect/StrokeWidthProfileSelect";
import { StrokeMiterAngleInput } from "../../components/StrokeMiterAngleInput/StrokeMiterAngleInput";
import { SPACE_SM } from "../../themes/styles";
import { FlipHorizontalIcon } from "../../icons";
import { StrokePropertyRow } from "./StrokePropertyRow";

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
          <StrokeStyleSelect value={style} onChange={onStyleChange} />
        </div>
      </StrokePropertyRow>

      <StrokePropertyRow label="Width profile">
        <div style={flexOneStyle}>
          <StrokeWidthProfileSelect value={widthProfile} onChange={onWidthProfileChange} />
        </div>
        <IconButton icon={<FlipHorizontalIcon size={16} />} aria-label="Flip width profile" size="md" />
      </StrokePropertyRow>

      <StrokePropertyRow label="Join">
        <StrokeJoinControl value={join} onChange={onJoinChange} />
      </StrokePropertyRow>

      <StrokePropertyRow label="Miter angle">
        <div style={flexOneStyle}>
          <StrokeMiterAngleInput value={miterAngle} onChange={onMiterAngleChange} />
        </div>
      </StrokePropertyRow>
    </div>
  );
});
