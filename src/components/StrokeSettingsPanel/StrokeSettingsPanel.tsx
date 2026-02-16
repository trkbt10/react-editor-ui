/**
 * @file StrokeSettingsPanel component - Comprehensive stroke settings panel
 */

import { memo, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Panel } from "../Panel/Panel";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { ImageSelect, type ImageSelectOption } from "../ImageSelect/ImageSelect";
import { Select, type SelectOption } from "../Select/Select";
import { Input } from "../Input/Input";
import { IconButton } from "../IconButton/IconButton";
import {
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_SM,
} from "../../constants/styles";
import {
  FlipHorizontalIcon,
  JoinMiterIcon,
  JoinRoundIcon,
  JoinBevelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "../../icons";

// Icons for input fields
const FrequencyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12h4l3-9 6 18 3-9h4" />
  </svg>
);

const WiggleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0 4 4 6 0" />
  </svg>
);

const SmoothIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 17c3.5-6 8-6 10.5 0s7-6 7.5-6" />
  </svg>
);

const MiterAngleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path d="M3 14V3h11v3H6v8H3z" />
  </svg>
);

// Width profile preview
function WidthProfilePreview({ variant = "uniform" }: { variant?: "uniform" | "taper-end" | "taper-both" }) {
  const previewStyle: CSSProperties = {
    width: "100%",
    height: "8px",
    display: "flex",
    alignItems: "center",
  };

  const getPath = () => {
    switch (variant) {
      case "taper-end":
        return "M0 4 Q40 2 80 4 Q120 6 160 4";
      case "taper-both":
        return "M0 4 Q20 2 40 4 Q80 6 120 4 Q140 6 160 4";
      default:
        return "M0 4 L160 4";
    }
  };

  const getStrokeWidth = () => {
    if (variant === "uniform") {
      return "4";
    }
    return "3";
  };

  return (
    <div style={previewStyle}>
      <svg width="100%" height="8" viewBox="0 0 160 8" preserveAspectRatio="none">
        <path
          d={getPath()}
          fill="none"
          stroke="currentColor"
          strokeWidth={getStrokeWidth()}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Brush preview
function BrushPreview({ type = "smooth" }: { type?: "smooth" | "rough" | "spray" }) {
  const previewStyle: CSSProperties = {
    width: "100%",
    height: "24px",
    display: "flex",
    alignItems: "center",
  };

  if (type === "rough") {
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

  if (type === "spray") {
    return (
      <div style={previewStyle}>
        <svg width="100%" height="24" viewBox="0 0 200 24" preserveAspectRatio="none">
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={i}
              cx={5 + (i * 5) + (Math.random() * 4 - 2)}
              cy={12 + (Math.random() * 8 - 4)}
              r={2 + Math.random() * 2}
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

export type StrokeStyle = "solid" | "dashed" | "dotted";
export type JoinType = "miter" | "round" | "bevel";
export type BrushDirection = "left" | "right";
export type WidthProfile = "uniform" | "taper-end" | "taper-both";
export type BrushType = "smooth" | "rough" | "spray";
export type StrokeTab = "basic" | "dynamic" | "brush";

export type StrokeSettings = {
  tab: StrokeTab;
  // Basic
  style: StrokeStyle;
  widthProfile: WidthProfile;
  join: JoinType;
  miterAngle: string;
  // Dynamic
  frequency: string;
  wiggle: string;
  smoothen: string;
  // Brush
  brushType: BrushType;
  brushDirection: BrushDirection;
  brushWidthProfile: WidthProfile;
};

export type StrokeSettingsPanelProps = {
  settings: StrokeSettings;
  onChange: (settings: StrokeSettings) => void;
  onClose?: () => void;
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

function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={rowStyle}>
      <span style={labelStyle}>{label}</span>
      <div style={controlStyle}>{children}</div>
    </div>
  );
}






export const StrokeSettingsPanel = memo(function StrokeSettingsPanel({
  settings,
  onChange,
  onClose,
  className,
}: StrokeSettingsPanelProps) {
  const updateSetting = useCallback(
    <K extends keyof StrokeSettings>(key: K, value: StrokeSettings[K]) => {
      onChange({ ...settings, [key]: value });
    },
    [onChange, settings],
  );

  const tabOptions = [
    { value: "basic" as const, label: "Basic" },
    { value: "dynamic" as const, label: "Dynamic" },
    { value: "brush" as const, label: "Brush" },
  ];

  const styleOptions: SelectOption<StrokeStyle>[] = [
    { value: "solid", label: "Solid" },
    { value: "dashed", label: "Dashed" },
    { value: "dotted", label: "Dotted" },
  ];

  const widthProfileOptions: ImageSelectOption<WidthProfile>[] = [
    {
      value: "uniform",
      image: <WidthProfilePreview variant="uniform" />,
    },
    {
      value: "taper-end",
      image: <WidthProfilePreview variant="taper-end" />,
    },
    {
      value: "taper-both",
      image: <WidthProfilePreview variant="taper-both" />,
    },
  ];

  const brushOptions: ImageSelectOption<BrushType>[] = [
    {
      value: "smooth",
      image: <BrushPreview type="smooth" />,
    },
    {
      value: "rough",
      image: <BrushPreview type="rough" />,
    },
    {
      value: "spray",
      image: <BrushPreview type="spray" />,
    },
  ];

  const joinOptions = [
    { value: "miter" as const, icon: <JoinMiterIcon size={20} />, "aria-label": "Miter join" },
    { value: "round" as const, icon: <JoinRoundIcon size={20} />, "aria-label": "Round join" },
    { value: "bevel" as const, icon: <JoinBevelIcon size={20} />, "aria-label": "Bevel join" },
  ];

  const directionOptions = [
    { value: "left" as const, icon: <ChevronLeftIcon size={18} />, "aria-label": "Left direction" },
    { value: "right" as const, icon: <ChevronRightIcon size={18} />, "aria-label": "Right direction" },
  ];

  const renderBasicTab = () => (
    <>
      <PropertyRow label="Style">
        <div style={{ flex: 1 }}>
          <Select
            options={styleOptions}
            value={settings.style}
            onChange={(v) => updateSetting("style", v)}
            aria-label="Stroke style"
          />
        </div>
      </PropertyRow>

      <PropertyRow label="Width profile">
        <div style={{ flex: 1 }}>
          <ImageSelect
            options={widthProfileOptions}
            value={settings.widthProfile}
            onChange={(v) => updateSetting("widthProfile", v)}
            aria-label="Width profile"
          />
        </div>
        <IconButton
          icon={<FlipHorizontalIcon size={16} />}
          aria-label="Flip width profile"
          size="md"
        />
      </PropertyRow>

      <PropertyRow label="Join">
        <SegmentedControl
          options={joinOptions}
          value={settings.join}
          onChange={(v) => updateSetting("join", v as JoinType)}
          size="md"
          aria-label="Join type"
        />
      </PropertyRow>

      <PropertyRow label="Miter angle">
        <div style={{ flex: 1 }}>
          <Input
            value={settings.miterAngle}
            onChange={(v) => updateSetting("miterAngle", v)}
            type="number"
            iconStart={<MiterAngleIcon />}
            suffix="°"
            aria-label="Miter angle"
          />
        </div>
      </PropertyRow>
    </>
  );

  const renderDynamicTab = () => (
    <>
      <PropertyRow label="Frequency">
        <div style={{ flex: 1 }}>
          <Input
            value={settings.frequency}
            onChange={(v) => updateSetting("frequency", v)}
            type="number"
            iconStart={<FrequencyIcon />}
            suffix="%"
            aria-label="Frequency"
          />
        </div>
      </PropertyRow>

      <PropertyRow label="Wiggle">
        <div style={{ flex: 1 }}>
          <Input
            value={settings.wiggle}
            onChange={(v) => updateSetting("wiggle", v)}
            type="number"
            iconStart={<WiggleIcon />}
            suffix="%"
            aria-label="Wiggle"
          />
        </div>
      </PropertyRow>

      <PropertyRow label="Smoothen">
        <div style={{ flex: 1 }}>
          <Input
            value={settings.smoothen}
            onChange={(v) => updateSetting("smoothen", v)}
            type="number"
            iconStart={<SmoothIcon />}
            suffix="%"
            aria-label="Smoothen"
          />
        </div>
      </PropertyRow>
    </>
  );

  const renderBrushTab = () => (
    <>
      <div>
        <ImageSelect
          options={brushOptions}
          value={settings.brushType}
          onChange={(v) => updateSetting("brushType", v)}
          size="lg"
          aria-label="Brush type"
        />
      </div>

      <PropertyRow label="Direction">
        <SegmentedControl
          options={directionOptions}
          value={settings.brushDirection}
          onChange={(v) => updateSetting("brushDirection", v as BrushDirection)}
          size="md"
          aria-label="Brush direction"
        />
      </PropertyRow>

      <PropertyRow label="Width profile">
        <div style={{ flex: 1 }}>
          <ImageSelect
            options={widthProfileOptions}
            value={settings.brushWidthProfile}
            onChange={(v) => updateSetting("brushWidthProfile", v)}
            aria-label="Brush width profile"
          />
        </div>
        <IconButton
          icon={<FlipHorizontalIcon size={16} />}
          aria-label="Flip brush width profile"
          size="md"
        />
      </PropertyRow>
    </>
  );

  const renderTabContent = () => {
    switch (settings.tab) {
      case "dynamic":
        return renderDynamicTab();
      case "brush":
        return renderBrushTab();
      default:
        return renderBasicTab();
    }
  };

  return (
    <Panel
      title="Stroke settings"
      onClose={onClose}
      width={320}
      className={className}
    >
      <SegmentedControl
        options={tabOptions}
        value={settings.tab}
        onChange={(v) => updateSetting("tab", v as StrokeTab)}
        aria-label="Stroke settings tab"
      />

      {renderTabContent()}
    </Panel>
  );
});
