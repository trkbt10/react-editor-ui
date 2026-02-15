/**
 * @file StrokePanelExpanded - Stroke settings panel with all options visible
 */

import type { CSSProperties, ReactNode } from "react";
import type {
  StrokeCap,
  StrokeJoin,
  StrokeAlign,
  DashPattern,
  ArrowheadSettings,
  WidthProfile,
} from "./types";
import type { WeightUnit } from "./StrokeWeightInput";
import { Panel } from "../Panel/Panel";
import { Input } from "../Input/Input";
import { StrokeCapSelect } from "./StrokeCapSelect";
import { StrokeJoinSelect } from "./StrokeJoinSelect";
import { StrokeAlignSelect } from "./StrokeAlignSelect";
import { StrokeDashEditor } from "./StrokeDashEditor";
import { StrokeArrowheadSelect } from "./StrokeArrowheadSelect";
import { StrokeProfileSelect } from "./StrokeProfileSelect";
import { StrokeWeightInput } from "./StrokeWeightInput";
import {
  COLOR_TEXT_MUTED,
  COLOR_DIVIDER,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
} from "../../constants/styles";

export type StrokePanelExpandedSettings = {
  weight: string;
  weightUnit: WeightUnit;
  cap: StrokeCap;
  join: StrokeJoin;
  miterLimit: string;
  align: StrokeAlign;
  dashed: boolean;
  dashPattern: DashPattern;
  arrowheads: ArrowheadSettings;
  profile: WidthProfile;
};

export type StrokePanelExpandedProps = {
  settings: StrokePanelExpandedSettings;
  onChange: (settings: StrokePanelExpandedSettings) => void;
  onClose?: () => void;
  title?: string;
  width?: number;
  className?: string;
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const labelStyle: CSSProperties = {
  width: "80px",
  flexShrink: 0,
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

const controlStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const dividerStyle: CSSProperties = {
  height: "1px",
  backgroundColor: COLOR_DIVIDER,
  margin: `${SPACE_MD} 0`,
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={controlStyle}>{children}</div>
    </div>
  );
}

export function createDefaultExpandedSettings(): StrokePanelExpandedSettings {
  return {
    weight: "1",
    weightUnit: "pt",
    cap: "butt",
    join: "miter",
    miterLimit: "10",
    align: "center",
    dashed: false,
    dashPattern: { values: ["", "", "", "", "", ""] },
    arrowheads: {
      start: "none",
      end: "none",
      startScale: "100",
      endScale: "100",
      align: "start",
    },
    profile: "uniform",
  };
}

export function StrokePanelExpanded({
  settings,
  onChange,
  onClose,
  title = "Stroke",
  width = 340,
  className,
}: StrokePanelExpandedProps) {
  const update = <K extends keyof StrokePanelExpandedSettings>(
    key: K,
    value: StrokePanelExpandedSettings[K],
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_MD,
  };

  return (
    <Panel title={title} onClose={onClose} width={width} className={className}>
      <div style={contentStyle}>
        <Row label="Weight:">
          <StrokeWeightInput
            value={settings.weight}
            onChange={(v) => update("weight", v)}
            unit={settings.weightUnit}
            onUnitChange={(u) => update("weightUnit", u)}
          />
        </Row>

        <Row label="Cap:">
          <StrokeCapSelect
            value={settings.cap}
            onChange={(v) => update("cap", v)}
          />
        </Row>

        <Row label="Corner:">
          <StrokeJoinSelect
            value={settings.join}
            onChange={(v) => update("join", v)}
          />
          <span style={{ ...labelStyle, width: "auto", marginLeft: SPACE_MD }}>Limit:</span>
          <div style={{ width: "50px" }}>
            <Input
              value={settings.miterLimit}
              onChange={(v) => update("miterLimit", v)}
              type="number"
              disabled={settings.join !== "miter"}
              aria-label="Miter limit"
            />
          </div>
        </Row>

        <Row label="Align:">
          <StrokeAlignSelect
            value={settings.align}
            onChange={(v) => update("align", v)}
          />
        </Row>

        <div style={dividerStyle} />

        <StrokeDashEditor
          enabled={settings.dashed}
          onEnabledChange={(v) => update("dashed", v)}
          pattern={settings.dashPattern}
          onPatternChange={(v) => update("dashPattern", v)}
          columns={6}
        />

        <div style={dividerStyle} />

        <StrokeArrowheadSelect
          value={settings.arrowheads}
          onChange={(v) => update("arrowheads", v)}
        />

        <div style={dividerStyle} />

        <Row label="Profile:">
          <StrokeProfileSelect
            value={settings.profile}
            onChange={(v) => update("profile", v)}
          />
        </Row>
      </div>
    </Panel>
  );
}
