/**
 * @file TypographyPanel component - Typography settings panel for text properties
 */

import { memo, useCallback, useMemo } from "react";
import { Panel } from "../Panel/Panel";
import { TypographySection } from "../../sections/TypographySection/TypographySection";
import type { TypographyData } from "../../sections/TypographySection/types";

/** @deprecated Import from sections/TypographySection/types instead */
export type TypographySettings = TypographyData;

export type TypographyPanelProps = {
  settings: TypographySettings;
  onChange: (settings: TypographySettings) => void;
  onClose?: () => void;
  fontOptions?: { value: string; label: string }[];
  weightOptions?: { value: string; label: string }[];
  onOpenFontsPanel?: () => void;
  onOpenSettings?: () => void;
  showFontIcon?: "always" | "never" | "missing-only";
  width?: number;
  className?: string;
};

/**
 * Typography settings panel with font, size, weight, color, and spacing controls.
 */
export const TypographyPanel = memo(function TypographyPanel({
  settings,
  onChange,
  onClose,
  fontOptions,
  weightOptions,
  onOpenFontsPanel,
  onOpenSettings,
  showFontIcon = "always",
  width = 320,
  className,
}: TypographyPanelProps) {
  const data = useMemo<TypographyData>(
    () => ({
      fontFamily: settings.fontFamily,
      fontWeight: settings.fontWeight,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      letterSpacing: settings.letterSpacing,
      textAlign: settings.textAlign,
      verticalAlign: settings.verticalAlign,
    }),
    [settings],
  );

  const handleChange = useCallback(
    (newData: TypographyData) => {
      onChange(newData);
    },
    [onChange],
  );

  return (
    <Panel title="Typography" onClose={onClose} width={width} className={className}>
      <TypographySection
        data={data}
        onChange={handleChange}
        fontOptions={fontOptions}
        weightOptions={weightOptions}
        onOpenFontsPanel={onOpenFontsPanel}
        onOpenSettings={onOpenSettings}
        showFontIcon={showFontIcon}
      />
    </Panel>
  );
});
