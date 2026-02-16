/**
 * @file StrokeArrowheadSelect - Arrowhead selector for start/end of path
 */

import type { CSSProperties, ReactNode } from "react";
import type { ArrowheadSettings, ArrowheadType, ArrowheadAlign } from "./types";
import { Select, type SelectOption } from "../Select/Select";
import { Input } from "../Input/Input";
import { IconButton } from "../IconButton/IconButton";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import {
  ArrowNoneIcon,
  ArrowTriangleIcon,
  ArrowOpenIcon,
  ArrowCircleIcon,
  ArrowSquareIcon,
  ArrowDiamondIcon,
  ArrowBarIcon,
  SwapIcon,
} from "../../icons";
import {
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
} from "../../constants/styles";

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

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const labelStyle: CSSProperties = {
  width: "60px",
  flexShrink: 0,
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

// Align icons
function AlignStartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="4" x2="4" y2="20" />
      <polygon points="8,8 18,12 8,16" fill="currentColor" />
    </svg>
  );
}

function AlignEndIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="20" y1="4" x2="20" y2="20" />
      <polygon points="16,8 6,12 16,16" fill="currentColor" />
    </svg>
  );
}

const alignOptions = [
  { value: "start" as const, icon: <AlignStartIcon />, "aria-label": "Align to path start" },
  { value: "end" as const, icon: <AlignEndIcon />, "aria-label": "Align to path end" },
];

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
      <div style={rowStyle}>
        <span style={labelStyle}>Arrows:</span>
        <div style={{ flex: 1 }}>
          <Select
            options={startOptions}
            value={value.start}
            onChange={(v) => update("start", v)}
            disabled={disabled}
            aria-label="Start arrow"
          />
        </div>
        <div style={{ flex: 1 }}>
          <Select
            options={endOptions}
            value={value.end}
            onChange={(v) => update("end", v)}
            disabled={disabled}
            aria-label="End arrow"
          />
        </div>
        <IconButton
          icon={<SwapIcon />}
          onClick={handleSwap}
          aria-label="Swap arrows"
          size="sm"
          disabled={disabled}
        />
      </div>

      {showScale && (
        <div style={rowStyle}>
          <span style={labelStyle}>Scale:</span>
          <div style={{ flex: 1 }}>
            <Input
              value={value.startScale}
              onChange={(v) => update("startScale", v)}
              type="number"
              suffix="%"
              disabled={disabled || value.start === "none"}
              aria-label="Start arrow scale"
            />
          </div>
          <div style={{ flex: 1 }}>
            <Input
              value={value.endScale}
              onChange={(v) => update("endScale", v)}
              type="number"
              suffix="%"
              disabled={disabled || value.end === "none"}
              aria-label="End arrow scale"
            />
          </div>
          <div style={{ width: "28px" }} />
        </div>
      )}

      {showAlign && (
        <div style={rowStyle}>
          <span style={labelStyle}>Align:</span>
          <SegmentedControl
            options={alignOptions}
            value={value.align}
            onChange={(v) => update("align", v as ArrowheadAlign)}
            size="sm"
            disabled={disabled}
            aria-label="Arrow alignment"
          />
        </div>
      )}
    </div>
  );
}
