/**
 * @file TypographySection component - Typography settings for text properties
 */

import { memo, useCallback, useMemo, type CSSProperties } from "react";
import { Select, type SelectOption } from "../../components/Select/Select";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { TooltipIconButton } from "../../components/TooltipIconButton/TooltipIconButton";
import { PropertyGrid } from "../../components/PropertyGrid/PropertyGrid";
import { PropertyGridItem } from "../../components/PropertyGrid/PropertyGridItem";
import {
  TextHorizontalAlignSelect,
  TextVerticalAlignSelect,
} from "../../components/AlignmentSelect/AlignmentSelect";
import {
  COLOR_TEXT_MUTED,
  COLOR_WARNING,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
} from "../../constants/styles";
import { SettingsIcon } from "../../icons";
import type {
  TypographySectionProps,
  FontOption,
  FontIconVisibility,
  VerticalAlign,
} from "./types";

// Default font options
const defaultFontOptions: FontOption[] = [
  { value: "SF Pro", label: "SF Pro" },
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
];

// Default weight options
const defaultWeightOptions = [
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

// Static styles
const containerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_MD,
};

const fontIconBaseStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 20,
  height: 20,
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
};

const fontIconMissingStyle: CSSProperties = {
  ...fontIconBaseStyle,
  backgroundColor: COLOR_WARNING,
  color: "#000",
};

const fontIconNormalStyle: CSSProperties = {
  ...fontIconBaseStyle,
  backgroundColor: COLOR_TEXT_MUTED,
  color: "#fff",
};

const fontFamilyRowContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

const flexOneStyle: CSSProperties = { flex: 1 };

const labeledUnitInputContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
  minWidth: 0,
  boxSizing: "border-box",
};

const labeledUnitInputLabelStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

const alignmentContainerStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: SPACE_SM,
};

const alignmentLabelStyle: CSSProperties = {
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
};

const alignmentRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_SM,
};

// Unit options
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

const FontIcon = memo(function FontIcon({ isMissing }: { isMissing: boolean }) {
  if (isMissing) {
    return (
      <span data-testid="font-icon-missing" style={fontIconMissingStyle}>
        A?
      </span>
    );
  }
  return (
    <span data-testid="font-icon" style={fontIconNormalStyle}>
      A
    </span>
  );
});

type FontFamilyRowProps = {
  value: string;
  options: SelectOption<string>[];
  onChange: (value: string) => void;
  onOpenFontsPanel?: () => void;
  showFontIcon?: FontIconVisibility;
};

const FontFamilyRow = memo(function FontFamilyRow({
  value,
  options,
  onChange,
  onOpenFontsPanel,
  showFontIcon = "always",
}: FontFamilyRowProps) {
  const isMissing = !options.some((opt) => opt.value === value);

  const shouldShowIcon =
    showFontIcon === "always" || (showFontIcon === "missing-only" && isMissing);

  const iconClickStyle = useMemo<CSSProperties>(
    () => ({ cursor: onOpenFontsPanel ? "pointer" : "default" }),
    [onOpenFontsPanel],
  );

  return (
    <div style={fontFamilyRowContainerStyle}>
      {shouldShowIcon && (
        <span onClick={onOpenFontsPanel} style={iconClickStyle}>
          <FontIcon isMissing={isMissing} />
        </span>
      )}
      <div style={flexOneStyle}>
        <Select
          options={options}
          value={value}
          onChange={onChange}
          aria-label="Font family"
        />
      </div>
    </div>
  );
});

type LabeledUnitInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  units: { value: string; label: string }[];
  allowAuto?: boolean;
  step?: number;
  shiftStep?: number;
};

const LabeledUnitInput = memo(function LabeledUnitInput({
  label,
  value,
  onChange,
  units,
  allowAuto = false,
  step = 1,
  shiftStep = 10,
}: LabeledUnitInputProps) {
  return (
    <div style={labeledUnitInputContainerStyle}>
      <span style={labeledUnitInputLabelStyle}>{label}</span>
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
});

/**
 * Typography section with font, size, weight, and spacing controls.
 */
export const TypographySection = memo(function TypographySection({
  data,
  onChange,
  fontOptions = defaultFontOptions,
  weightOptions = defaultWeightOptions,
  onOpenFontsPanel,
  onOpenSettings,
  showFontIcon = "always",
  className,
}: TypographySectionProps) {
  const handleFontFamilyChange = useCallback(
    (v: string) => onChange({ ...data, fontFamily: v }),
    [onChange, data],
  );

  const handleFontWeightChange = useCallback(
    (v: string) => onChange({ ...data, fontWeight: v }),
    [onChange, data],
  );

  const handleFontSizeChange = useCallback(
    (v: string) => onChange({ ...data, fontSize: v }),
    [onChange, data],
  );

  const handleLineHeightChange = useCallback(
    (v: string) => onChange({ ...data, lineHeight: v }),
    [onChange, data],
  );

  const handleLetterSpacingChange = useCallback(
    (v: string) => onChange({ ...data, letterSpacing: v }),
    [onChange, data],
  );

  const handleTextAlignChange = useCallback(
    (v: "left" | "center" | "right") => onChange({ ...data, textAlign: v }),
    [onChange, data],
  );

  const handleVerticalAlignChange = useCallback(
    (v: VerticalAlign) => onChange({ ...data, verticalAlign: v }),
    [onChange, data],
  );

  const fontSelectOptions = useMemo<SelectOption<string>[]>(
    () => fontOptions.map((f) => ({ value: f.value, label: f.label })),
    [fontOptions],
  );

  const weightSelectOptions = useMemo<SelectOption<string>[]>(
    () => weightOptions.map((w) => ({ value: w.value, label: w.label })),
    [weightOptions],
  );

  return (
    <div className={className} style={containerStyle}>
      <FontFamilyRow
        value={data.fontFamily}
        options={fontSelectOptions}
        onChange={handleFontFamilyChange}
        onOpenFontsPanel={onOpenFontsPanel}
        showFontIcon={showFontIcon}
      />
      <PropertyGrid columns={2}>
        <PropertyGridItem>
          <Select
            options={weightSelectOptions}
            value={data.fontWeight}
            onChange={handleFontWeightChange}
            aria-label="Font weight"
          />
        </PropertyGridItem>
        <PropertyGridItem>
          <UnitInput
            value={data.fontSize}
            onChange={handleFontSizeChange}
            units={fontSizeUnits}
            aria-label="Font size"
          />
        </PropertyGridItem>
      </PropertyGrid>
      <PropertyGrid columns={2}>
        <PropertyGridItem>
          <LabeledUnitInput
            label="Line height"
            value={data.lineHeight}
            onChange={handleLineHeightChange}
            units={lineHeightUnits}
            allowAuto
            step={0.1}
            shiftStep={0.5}
          />
        </PropertyGridItem>
        <PropertyGridItem>
          <LabeledUnitInput
            label="Letter spacing"
            value={data.letterSpacing}
            onChange={handleLetterSpacingChange}
            units={letterSpacingUnits}
            step={0.1}
            shiftStep={1}
          />
        </PropertyGridItem>
      </PropertyGrid>
      <PropertyGrid columns={2}>
        <PropertyGridItem>
          <div style={alignmentContainerStyle}>
            <span style={alignmentLabelStyle}>Horizontal</span>
            <TextHorizontalAlignSelect
              value={data.textAlign as "left" | "center" | "right"}
              onChange={handleTextAlignChange}
            />
          </div>
        </PropertyGridItem>
        <PropertyGridItem>
          <div style={alignmentContainerStyle}>
            <span style={alignmentLabelStyle}>Vertical</span>
            <div style={alignmentRowStyle}>
              <TextVerticalAlignSelect
                value={data.verticalAlign}
                onChange={handleVerticalAlignChange}
              />
              <TooltipIconButton
                icon={<SettingsIcon />}
                tooltip="Advanced settings"
                size="sm"
                onClick={onOpenSettings}
              />
            </div>
          </div>
        </PropertyGridItem>
      </PropertyGrid>
    </div>
  );
});
