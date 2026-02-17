/**
 * @file StrokeJoinControl - Stroke join type selector (miter/round/bevel)
 */

import { memo } from "react";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import {
  JoinMiterIcon,
  JoinRoundIcon,
  JoinBevelIcon,
} from "../../icons";

export type JoinType = "miter" | "round" | "bevel";

export type StrokeJoinControlProps = {
  /** Current join type */
  value: JoinType;
  /** Called when join type changes */
  onChange: (value: JoinType | JoinType[]) => void;
  /** Size variant */
  size?: "sm" | "md";
  /** Aria label */
  "aria-label"?: string;
};

const joinOptions = [
  { value: "miter" as const, icon: <JoinMiterIcon size={20} />, "aria-label": "Miter join" },
  { value: "round" as const, icon: <JoinRoundIcon size={20} />, "aria-label": "Round join" },
  { value: "bevel" as const, icon: <JoinBevelIcon size={20} />, "aria-label": "Bevel join" },
];

/**
 * Stroke join type selector.
 */
export const StrokeJoinControl = memo(function StrokeJoinControl({
  value,
  onChange,
  size = "md",
  "aria-label": ariaLabel = "Join type",
}: StrokeJoinControlProps) {
  return (
    <SegmentedControl
      options={joinOptions}
      value={value}
      onChange={onChange}
      size={size}
      aria-label={ariaLabel}
    />
  );
});
