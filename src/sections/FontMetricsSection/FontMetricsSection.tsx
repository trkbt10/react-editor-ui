/**
 * @file FontMetricsSection component - Font size, leading, kerning, tracking
 *
 * @description
 * Section for controlling detailed font metrics including size, line height (leading),
 * kerning mode, and tracking (letter spacing).
 *
 * @example
 * ```tsx
 * import { FontMetricsSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({
 *   size: "12 pt",
 *   leading: "auto",
 *   kerning: "auto" as const,
 *   tracking: "0",
 * });
 *
 * <FontMetricsSection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexColumn, IconRow, LabeledField } from "../shared/SectionLayouts";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { Select, type SelectOption } from "../../components/Select/Select";
import { PropertyGrid } from "../../components/PropertyGrid/PropertyGrid";
import { PropertyGridItem } from "../../components/PropertyGrid/PropertyGridItem";
import { KerningIcon, TrackingIcon } from "../../icons";
import type { FontMetricsSectionProps, KerningMode } from "./types";

const sizeUnits = [
  { value: "pt", label: "pt" },
  { value: "px", label: "px" },
  { value: "em", label: "em" },
];

const leadingUnits = [
  { value: "", label: "—" },
  { value: "pt", label: "pt" },
  { value: "px", label: "px" },
  { value: "%", label: "%" },
];

const kerningOptions: SelectOption<KerningMode>[] = [
  { value: "auto", label: "Auto" },
  { value: "optical", label: "Optical" },
  { value: "metrics", label: "Metrics" },
  { value: "none", label: "None (0)" },
];

/**
 * Section for font metrics controls.
 */
export const FontMetricsSection = memo(function FontMetricsSection({
  data,
  onChange,
  disabled = false,
  className,
}: FontMetricsSectionProps) {
  const handleSizeChange = useCallback(
    (size: string) => {
      onChange({ ...data, size });
    },
    [data, onChange],
  );

  const handleLeadingChange = useCallback(
    (leading: string) => {
      onChange({ ...data, leading });
    },
    [data, onChange],
  );

  const handleKerningChange = useCallback(
    (kerning: string) => {
      onChange({ ...data, kerning: kerning as KerningMode });
    },
    [data, onChange],
  );

  const handleTrackingChange = useCallback(
    (tracking: string) => {
      onChange({ ...data, tracking });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Font Metrics" className={className}>
      <FlexColumn>
        <PropertyGrid columns={2}>
          <PropertyGridItem>
            <LabeledField label="Size">
              <UnitInput
                value={data.size}
                onChange={handleSizeChange}
                units={sizeUnits}
                disabled={disabled}
                aria-label="Font size"
              />
            </LabeledField>
          </PropertyGridItem>
          <PropertyGridItem>
            <LabeledField label="Leading">
              <UnitInput
                value={data.leading}
                onChange={handleLeadingChange}
                units={leadingUnits}
                allowAuto
                disabled={disabled}
                aria-label="Line height"
              />
            </LabeledField>
          </PropertyGridItem>
        </PropertyGrid>
        <IconRow icon={<KerningIcon />}>
          <Select
            options={kerningOptions}
            value={data.kerning}
            onChange={handleKerningChange}
            disabled={disabled}
            aria-label="Kerning"
          />
        </IconRow>
        <IconRow icon={<TrackingIcon />}>
          <UnitInput
            value={data.tracking}
            onChange={handleTrackingChange}
            units={[{ value: "", label: "" }]}
            disabled={disabled}
            aria-label="Tracking"
          />
        </IconRow>
      </FlexColumn>
    </SectionLayout>
  );
});
