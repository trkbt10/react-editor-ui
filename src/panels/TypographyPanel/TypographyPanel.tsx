/**
 * @file TypographyPanel component - Typography settings for text properties
 *
 * @description
 * Panel content for text styling with font family, weight, size, line height, letter spacing,
 * and alignment controls. Supports custom font options and integration with a
 * separate fonts panel for font selection. Wrap with PanelFrame for floating panel UI.
 *
 * @example
 * ```tsx
 * import { TypographyPanel } from "react-editor-ui/panels/TypographyPanel";
 * import { PanelFrame } from "react-editor-ui/PanelFrame";
 *
 * const [settings, setSettings] = useState({
 *   fontFamily: "Inter",
 *   fontWeight: "400",
 *   fontSize: "16px",
 *   lineHeight: "1.5",
 *   letterSpacing: "0",
 *   textAlign: "left",
 *   verticalAlign: "top",
 * });
 *
 * <PanelFrame title="Typography" onClose={handleClose}>
 *   <TypographyPanel settings={settings} onChange={setSettings} />
 * </PanelFrame>
 * ```
 */

import { memo, useCallback, useMemo } from "react";
import { TypographySection } from "../../sections/TypographySection/TypographySection";
import type { TypographyData } from "../../sections/TypographySection/types";

/** @deprecated Import from sections/TypographySection/types instead */
export type TypographySettings = TypographyData;

export type TypographyPanelProps = {
  settings: TypographySettings;
  onChange: (settings: TypographySettings) => void;
  fontOptions?: { value: string; label: string }[];
  weightOptions?: { value: string; label: string }[];
  onOpenFontsPanel?: () => void;
  onOpenSettings?: () => void;
  showFontIcon?: "always" | "never" | "missing-only";
  className?: string;
};

/**
 * Typography panel content with font, size, weight, color, and spacing controls.
 */
export const TypographyPanel = memo(function TypographyPanel({
  settings,
  onChange,
  fontOptions,
  weightOptions,
  onOpenFontsPanel,
  onOpenSettings,
  showFontIcon = "always",
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
    <TypographySection
      data={data}
      onChange={handleChange}
      fontOptions={fontOptions}
      weightOptions={weightOptions}
      onOpenFontsPanel={onOpenFontsPanel}
      onOpenSettings={onOpenSettings}
      showFontIcon={showFontIcon}
      className={className}
    />
  );
});
