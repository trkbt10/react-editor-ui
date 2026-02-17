/**
 * @file StrokeArrowheadSelect - Arrowhead selector for start/end of path
 */

import type { CSSProperties, ReactNode } from "react";
import type { ArrowheadSettings, ArrowheadType, ArrowheadAlign } from "./types";
import { Select, type SelectOption } from "../../components/Select/Select";
import { Input } from "../../components/Input/Input";
import { TooltipIconButton } from "../../components/TooltipIconButton/TooltipIconButton";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import {
  ArrowNoneIcon,
  ArrowTriangleIcon,
  ArrowOpenIcon,
  ArrowCircleIcon,
  ArrowSquareIcon,
  ArrowDiamondIcon,
  ArrowBarIcon,
  SwapIcon,
  AlignStartIcon,
  AlignEndIcon,
} from "../../icons";
import { SPACE_MD } from "../../themes/styles";

export type StrokeArrowheadSelectProps = {
  value: ArrowheadSettings;
  onChange: (value: ArrowheadSettings) => void;
  disabled?: boolean;
  showScale?: boolean;
  showAlign?: boolean;
};

function wrapIcon(icon: ReactNode, reversed: boolean) {
  const transform = reversed ? "scaleX(-1)" : undefined;
  return <span style={{ display: "flex", transform }}>{icon}</span>;
}

function createOptions(reversed: boolean): SelectOption<ArrowheadType>[] {
  return [
    { value: "none", preview: wrapIcon(<ArrowNoneIcon />, reversed) },
    { value: "triangle", preview: wrapIcon(<ArrowTriangleIcon />, reversed) },
    { value: "triangle-open", preview: wrapIcon(<ArrowOpenIcon />, reversed) },
    { value: "circle", preview: wrapIcon(<ArrowCircleIcon />, reversed) },
    { value: "square", preview: wrapIcon(<ArrowSquareIcon />, reversed) },
    { value: "diamond", preview: wrapIcon(<ArrowDiamondIcon />, reversed) },
    { value: "bar", preview: wrapIcon(<ArrowBarIcon />, reversed) },
  ];
}

const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_MD,
};

const alignOptions = [
  { value: "start" as const, icon: <AlignStartIcon />, "aria-label": "Align to path start" },
  { value: "end" as const, icon: <AlignEndIcon />, "aria-label": "Align to path end" },
];

/** Arrowhead selector with start/end style pickers, scale inputs, and swap button */
export function StrokeArrowheadSelect({
  value,
  onChange,
  disabled = false,
  showScale = true,
  showAlign = true,
}: StrokeArrowheadSelectProps) {
  const startOptions = createOptions(true);
  const endOptions = createOptions(false);

  const handleSwap = () => {
    onChange({
      ...value,
      start: value.end,
      end: value.start,
      startScale: value.endScale,
      endScale: value.startScale,
    });
  };

  const update = <K extends keyof ArrowheadSettings>(
    key: K,
    newValue: ArrowheadSettings[K],
  ) => {
    onChange({ ...value, [key]: newValue });
  };

  return (
    <div style={containerStyle}>
      <ControlRow
        label="Arrows:"
        gap="sm"
        action={
          <TooltipIconButton
            icon={<SwapIcon />}
            onClick={handleSwap}
            tooltip="Swap arrows"
            size="sm"
            disabled={disabled}
          />
        }
      >
        <Select
          options={startOptions}
          value={value.start}
          onChange={(v) => update("start", v)}
          disabled={disabled}
          aria-label="Start arrow"
        />
        <Select
          options={endOptions}
          value={value.end}
          onChange={(v) => update("end", v)}
          disabled={disabled}
          aria-label="End arrow"
        />
      </ControlRow>

      {showScale && (
        <ControlRow label="Scale:" gap="sm" spacer>
          <Input
            value={value.startScale}
            onChange={(v) => update("startScale", v)}
            type="number"
            suffix="%"
            disabled={disabled || value.start === "none"}
            aria-label="Start arrow scale"
          />
          <Input
            value={value.endScale}
            onChange={(v) => update("endScale", v)}
            type="number"
            suffix="%"
            disabled={disabled || value.end === "none"}
            aria-label="End arrow scale"
          />
        </ControlRow>
      )}

      {showAlign && (
        <ControlRow label="Align:" gap="sm">
          <SegmentedControl
            options={alignOptions}
            value={value.align}
            onChange={(v) => update("align", v as ArrowheadAlign)}
            size="sm"
            disabled={disabled}
            aria-label="Arrow alignment"
          />
        </ControlRow>
      )}
    </div>
  );
}
