/**
 * @file StrokePanelCompact - Stroke settings panel with tabbed interface
 */

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type {
  StrokeJoin,
  DashPattern,
  ArrowheadSettings,
  WidthProfile,
} from "./types";
import { Panel } from "../Panel/Panel";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { ImageSelect, type ImageSelectOption } from "../ImageSelect/ImageSelect";
import { Select, type SelectOption } from "../Select/Select";
import { Input } from "../Input/Input";
import { StrokeJoinSelect } from "./StrokeJoinSelect";
import { StrokeProfileSelect } from "./StrokeProfileSelect";
import { StrokeDashEditor } from "./StrokeDashEditor";
import { StrokeArrowheadSelect } from "./StrokeArrowheadSelect";
import {
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
} from "../../constants/styles";

export type StrokeLineStyle = "solid" | "dashed" | "dotted";
export type BrushStyle = "smooth" | "rough" | "spray";
export type BrushDirection = "left" | "right";

export type StrokePanelCompactSettings = {
  // Basic tab
  lineStyle: StrokeLineStyle;
  profile: WidthProfile;
  join: StrokeJoin;
  miterLimit: string;
  dashed: boolean;
  dashPattern: DashPattern;
  arrowheads: ArrowheadSettings;
  // Dynamic tab
  frequency: string;
  wiggle: string;
  smoothen: string;
  // Brush tab
  brushStyle: BrushStyle;
  brushDirection: BrushDirection;
};

export type StrokePanelCompactTab = "basic" | "dynamic" | "brush";

export type StrokePanelCompactProps = {
  settings: StrokePanelCompactSettings;
  onChange: (settings: StrokePanelCompactSettings) => void;
  onClose?: () => void;
  initialTab?: StrokePanelCompactTab;
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

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={controlStyle}>{children}</div>
    </div>
  );
}

// Dynamic icons
function FrequencyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12h4l3-9 6 18 3-9h4" />
    </svg>
  );
}

function WiggleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0 4 4 6 0" />
    </svg>
  );
}

function SmoothIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17c3.5-6 8-6 10.5 0s7-6 7.5-6" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// Brush preview
function BrushPreview({ style }: { style: BrushStyle }) {
  const previewStyle: CSSProperties = {
    width: "100%",
    height: "24px",
    display: "flex",
    alignItems: "center",
  };

  if (style === "rough") {
    return (
      <div style={previewStyle}>
        <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
          <path
            d="M0 12 Q10 8 20 12 Q30 16 40 12 Q50 8 60 12 Q70 16 80 12 Q90 8 100 12 Q110 16 120 12 Q130 8 140 12 Q150 16 160 12 Q170 8 180 12 Q190 16 200 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  if (style === "spray") {
    return (
      <div style={previewStyle}>
        <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={i}
              cx={5 + i * 5 + Math.sin(i * 1.5) * 2}
              cy={12 + Math.cos(i * 2) * 4}
              r={2 + (i % 3)}
              fill="currentColor"
            />
          ))}
        </svg>
      </div>
    );
  }

  return (
    <div style={previewStyle}>
      <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
        <path
          d="M0 12 Q50 6 100 12 Q150 18 200 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function createDefaultCompactSettings(): StrokePanelCompactSettings {
  return {
    lineStyle: "solid",
    profile: "uniform",
    join: "miter",
    miterLimit: "10",
    dashed: false,
    dashPattern: { values: ["", ""] },
    arrowheads: {
      start: "none",
      end: "none",
      startScale: "100",
      endScale: "100",
      align: "start",
    },
    frequency: "50",
    wiggle: "0",
    smoothen: "50",
    brushStyle: "smooth",
    brushDirection: "right",
  };
}

export function StrokePanelCompact({
  settings,
  onChange,
  onClose,
  initialTab = "basic",
  title = "Stroke Settings",
  width = 320,
  className,
}: StrokePanelCompactProps) {
  const [activeTab, setActiveTab] = useState<StrokePanelCompactTab>(initialTab);

  const update = <K extends keyof StrokePanelCompactSettings>(
    key: K,
    value: StrokePanelCompactSettings[K],
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const tabOptions = [
    { value: "basic" as const, label: "Basic" },
    { value: "dynamic" as const, label: "Dynamic" },
    { value: "brush" as const, label: "Brush" },
  ];

  const styleOptions: SelectOption<StrokeLineStyle>[] = [
    { value: "solid", label: "Solid" },
    { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" },
  ];

  const brushOptions: ImageSelectOption<BrushStyle>[] = [
    { value: "smooth", image: <BrushPreview style="smooth" /> },
    { value: "rough", image: <BrushPreview style="rough" /> },
    { value: "spray", image: <BrushPreview style="spray" /> },
  ];

  const directionOptions = [
    { value: "left" as const, icon: <ArrowLeftIcon />, "aria-label": "Left" },
    { value: "right" as const, icon: <ArrowRightIcon />, "aria-label": "Right" },
  ];

  const renderBasicTab = () => (
    <>
      <Row label="Style">
        <div style={{ flex: 1 }}>
          <Select
            options={styleOptions}
            value={settings.lineStyle}
            onChange={(v) => update("lineStyle", v)}
            aria-label="Line style"
          />
        </div>
      </Row>

      <Row label="Profile">
        <StrokeProfileSelect
          value={settings.profile}
          onChange={(v) => update("profile", v)}
        />
      </Row>

      <Row label="Join">
        <StrokeJoinSelect
          value={settings.join}
          onChange={(v) => update("join", v)}
        />
      </Row>

      <Row label="Miter">
        <div style={{ flex: 1 }}>
          <Input
            value={settings.miterLimit}
            onChange={(v) => update("miterLimit", v)}
            type="number"
            suffix="°"
            disabled={settings.join !== "miter"}
            aria-label="Miter limit"
          />
        </div>
      </Row>

      <StrokeDashEditor
        enabled={settings.dashed}
        onEnabledChange={(v) => update("dashed", v)}
        pattern={settings.dashPattern}
        onPatternChange={(v) => update("dashPattern", v)}
        columns={2}
      />

      <StrokeArrowheadSelect
        value={settings.arrowheads}
        onChange={(v) => update("arrowheads", v)}
        showScale={false}
        showAlign={false}
      />
    </>
  );

  const renderDynamicTab = () => (
    <>
      <Row label="Frequency">
        <div style={{ flex: 1 }}>
          <Input
            value={settings.frequency}
            onChange={(v) => update("frequency", v)}
            type="number"
            iconStart={<FrequencyIcon />}
            suffix="%"
            aria-label="Frequency"
          />
        </div>
      </Row>

      <Row label="Wiggle">
        <div style={{ flex: 1 }}>
          <Input
            value={settings.wiggle}
            onChange={(v) => update("wiggle", v)}
            type="number"
            iconStart={<WiggleIcon />}
            suffix="%"
            aria-label="Wiggle"
          />
        </div>
      </Row>

      <Row label="Smoothen">
        <div style={{ flex: 1 }}>
          <Input
            value={settings.smoothen}
            onChange={(v) => update("smoothen", v)}
            type="number"
            iconStart={<SmoothIcon />}
            suffix="%"
            aria-label="Smoothen"
          />
        </div>
      </Row>
    </>
  );

  const renderBrushTab = () => (
    <>
      <div>
        <ImageSelect
          options={brushOptions}
          value={settings.brushStyle}
          onChange={(v) => update("brushStyle", v)}
          size="lg"
          aria-label="Brush style"
        />
      </div>

      <Row label="Direction">
        <SegmentedControl
          options={directionOptions}
          value={settings.brushDirection}
          onChange={(v) => update("brushDirection", v as BrushDirection)}
          size="sm"
          aria-label="Direction"
        />
      </Row>

      <Row label="Profile">
        <StrokeProfileSelect
          value={settings.profile}
          onChange={(v) => update("profile", v)}
        />
      </Row>
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dynamic":
        return renderDynamicTab();
      case "brush":
        return renderBrushTab();
      default:
        return renderBasicTab();
    }
  };

  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_MD,
  };

  return (
    <Panel title={title} onClose={onClose} width={width} className={className}>
      <SegmentedControl
        options={tabOptions}
        value={activeTab}
        onChange={(v) => setActiveTab(v as StrokePanelCompactTab)}
        aria-label="Tab"
      />
      <div style={contentStyle}>{renderContent()}</div>
    </Panel>
  );
}
