/**
 * @file TypographyPanel component - Typography settings panel for text properties
 */

import { useState, type CSSProperties } from "react";
import { Select, type SelectOption } from "../Select/Select";
import { UnitInput } from "../UnitInput/UnitInput";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { IconButton } from "../IconButton/IconButton";
import { SectionHeader } from "../SectionHeader/SectionHeader";
import { PropertyGrid } from "../PropertyGrid/PropertyGrid";
import { PropertyGridItem } from "../PropertyGrid/PropertyGridItem";
import {
  COLOR_TEXT_MUTED,
  COLOR_WARNING,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
} from "../../constants/styles";

export type TextAlign = "left" | "center" | "right" | "justify";
export type VerticalAlign = "top" | "middle" | "bottom";

export type TypographySettings = {
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: TextAlign;
  verticalAlign: VerticalAlign;
};

export type FontOption = {
  value: string;
  label: string;
};

export type FontWeightOption = {
  value: string;
  label: string;
};

export type FontIconVisibility = 'always' | 'never' | 'missing-only';

export type TypographyPanelProps = {
  settings: TypographySettings;
  onChange: (settings: TypographySettings) => void;
  fontOptions?: FontOption[];
  weightOptions?: FontWeightOption[];
  onOpenFontsPanel?: () => void;
  onOpenSettings?: () => void;
  /** Controls font icon visibility: 'always' (default), 'never', or 'missing-only' */
  showFontIcon?: FontIconVisibility;
  className?: string;
};

// Default font options
const defaultFontOptions: FontOption[] = [
  { value: "SF Pro", label: "SF Pro" },
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
];

// Default weight options
const defaultWeightOptions: FontWeightOption[] = [
  { value: "100", label: "Thin" },
  { value: "200", label: "Extra Light" },
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semi Bold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
  { value: "900", label: "Black" },
];

// Icons
function FontIcon({ isMissing }: { isMissing: boolean }) {
  if (isMissing) {
    return (
      <span
        data-testid="font-icon-missing"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          borderRadius: 4,
          backgroundColor: COLOR_WARNING,
          color: "#000",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        A?
      </span>
    );
  }
  return (
    <span
      data-testid="font-icon"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        borderRadius: 4,
        backgroundColor: COLOR_TEXT_MUTED,
        color: "#fff",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      A
    </span>
  );
}

const AlignLeftIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="17" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="17" y1="18" x2="3" y2="18" />
  </svg>
);

const AlignCenterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="10" x2="6" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="18" y1="18" x2="6" y2="18" />
  </svg>
);

const AlignRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="21" y1="10" x2="7" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="7" y2="18" />
  </svg>
);

const AlignTopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="3" x2="12" y2="15" />
    <polyline points="8 7 12 3 16 7" />
  </svg>
);

const AlignMiddleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="3" x2="12" y2="9" />
    <line x1="12" y1="15" x2="12" y2="21" />
    <polyline points="8 6 12 3 16 6" />
    <polyline points="16 18 12 21 8 18" />
  </svg>
);

const AlignBottomIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="9" x2="12" y2="21" />
    <polyline points="16 17 12 21 8 17" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

function FontFamilyRow({
  value,
  options,
  onChange,
  onOpenFontsPanel,
  showFontIcon = 'always',
}: {
  value: string;
  options: SelectOption<string>[];
  onChange: (value: string) => void;
  onOpenFontsPanel?: () => void;
  showFontIcon?: FontIconVisibility;
}) {
  const isMissing = !options.some((opt) => opt.value === value);

  const shouldShowIcon =
    showFontIcon === 'always' ||
    (showFontIcon === 'missing-only' && isMissing);

  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_SM,
  };

  return (
    <div style={containerStyle}>
      {shouldShowIcon && (
        <span
          onClick={onOpenFontsPanel}
          style={{ cursor: onOpenFontsPanel ? "pointer" : "default" }}
        >
          <FontIcon isMissing={isMissing} />
        </span>
      )}
      <div style={{ flex: 1 }}>
        <Select
          options={options}
          value={value}
          onChange={onChange}
          aria-label="Font family"
        />
      </div>
    </div>
  );
}

const fontSizeUnits = [
  { value: "px", label: "px" },
  { value: "pt", label: "pt" },
  { value: "em", label: "em" },
  { value: "rem", label: "rem" },
];

const lineHeightUnits = [
  { value: "", label: "—" },
  { value: "px", label: "px" },
  { value: "em", label: "em" },
  { value: "%", label: "%" },
];

const letterSpacingUnits = [
  { value: "px", label: "px" },
  { value: "em", label: "em" },
  { value: "%", label: "%" },
];

function LabeledUnitInput({
  label,
  value,
  onChange,
  units,
  allowAuto = false,
  step = 1,
  shiftStep = 10,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  units: { value: string; label: string }[];
  allowAuto?: boolean;
  step?: number;
  shiftStep?: number;
}) {
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_SM,
    minWidth: 0,
    boxSizing: "border-box",
  };

  const labelStyle: CSSProperties = {
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
  };

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{label}</span>
      <UnitInput
        value={value}
        onChange={onChange}
        units={units}
        allowAuto={allowAuto}
        step={step}
        shiftStep={shiftStep}
        aria-label={label}
      />
    </div>
  );
}
















export function TypographyPanel({
  settings,
  onChange,
  fontOptions = defaultFontOptions,
  weightOptions = defaultWeightOptions,
  onOpenFontsPanel,
  onOpenSettings,
  showFontIcon = 'always',
  className,
}: TypographyPanelProps) {
  const [expanded, setExpanded] = useState(true);

  const handleChange = <K extends keyof TypographySettings>(
    key: K,
    value: TypographySettings[K],
  ) => {
    onChange({ ...settings, [key]: value });
  };

  const contentStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_MD,
    padding: `${SPACE_SM} ${SPACE_MD}`,
  };

  const alignmentRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_SM,
  };

  const fontSelectOptions: SelectOption<string>[] = fontOptions.map((f) => ({
    value: f.value,
    label: f.label,
  }));

  const weightSelectOptions: SelectOption<string>[] = weightOptions.map((w) => ({
    value: w.value,
    label: w.label,
  }));

  const horizontalAlignOptions = [
    { value: "left" as const, icon: <AlignLeftIcon />, "aria-label": "Align left" },
    { value: "center" as const, icon: <AlignCenterIcon />, "aria-label": "Align center" },
    { value: "right" as const, icon: <AlignRightIcon />, "aria-label": "Align right" },
  ];

  const verticalAlignOptions = [
    { value: "top" as const, icon: <AlignTopIcon />, "aria-label": "Align top" },
    { value: "middle" as const, icon: <AlignMiddleIcon />, "aria-label": "Align middle" },
    { value: "bottom" as const, icon: <AlignBottomIcon />, "aria-label": "Align bottom" },
  ];

  const headerAction = (
    <IconButton
      icon={<GridIcon />}
      aria-label="Grid options"
      size="sm"
      onClick={onOpenSettings}
    />
  );

  const alignmentLabelStyle: CSSProperties = {
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
    display: "block",
    marginBottom: SPACE_SM,
  };

  const renderContent = () => {
    if (!expanded) {
      return null;
    }
    return (
      <div style={contentStyle}>
        <FontFamilyRow
          value={settings.fontFamily}
          options={fontSelectOptions}
          onChange={(v) => handleChange("fontFamily", v)}
          onOpenFontsPanel={onOpenFontsPanel}
          showFontIcon={showFontIcon}
        />
        <PropertyGrid columns={2}>
          <PropertyGridItem>
            <Select
              options={weightSelectOptions}
              value={settings.fontWeight}
              onChange={(v) => handleChange("fontWeight", v)}
              aria-label="Font weight"
            />
          </PropertyGridItem>
          <PropertyGridItem>
            <UnitInput
              value={settings.fontSize}
              onChange={(v) => handleChange("fontSize", v)}
              units={fontSizeUnits}
              aria-label="Font size"
            />
          </PropertyGridItem>
        </PropertyGrid>
        <PropertyGrid columns={2}>
          <PropertyGridItem>
            <LabeledUnitInput
              label="Line height"
              value={settings.lineHeight}
              onChange={(v) => handleChange("lineHeight", v)}
              units={lineHeightUnits}
              allowAuto
              step={0.1}
              shiftStep={0.5}
            />
          </PropertyGridItem>
          <PropertyGridItem>
            <LabeledUnitInput
              label="Letter spacing"
              value={settings.letterSpacing}
              onChange={(v) => handleChange("letterSpacing", v)}
              units={letterSpacingUnits}
              step={0.1}
              shiftStep={1}
            />
          </PropertyGridItem>
        </PropertyGrid>
        <div>
          <span style={alignmentLabelStyle}>Alignment</span>
          <div style={alignmentRowStyle}>
            <SegmentedControl
              options={horizontalAlignOptions}
              value={settings.textAlign}
              onChange={(v) => handleChange("textAlign", v as TextAlign)}
              aria-label="Horizontal alignment"
            />
            <SegmentedControl
              options={verticalAlignOptions}
              value={settings.verticalAlign}
              onChange={(v) => handleChange("verticalAlign", v as VerticalAlign)}
              aria-label="Vertical alignment"
            />
            <IconButton
              icon={<SettingsIcon />}
              aria-label="Advanced settings"
              size="sm"
              onClick={onOpenSettings}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      <SectionHeader
        title="Typography"
        collapsible
        expanded={expanded}
        onToggle={setExpanded}
        action={headerAction}
      />
      {renderContent()}
    </div>
  );
}
