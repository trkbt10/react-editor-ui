/**
 * @file FontSection component - Font family and weight controls
 *
 * @description
 * Section for selecting font family and weight with optional font panel access.
 *
 * @example
 * ```tsx
 * import { FontSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({ family: "Inter", weight: "400" });
 *
 * <FontSection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback, useMemo } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexColumn } from "../shared/SectionLayouts";
import { Select, type SelectOption } from "../../components/Select/Select";
import type { FontSectionProps, FontOption, WeightOption } from "./types";

const defaultFontOptions: FontOption[] = [
  { value: "sans-serif", label: "Sans-serif" },
  { value: "serif", label: "Serif" },
  { value: "monospace", label: "Monospace" },
  { value: "cursive", label: "Cursive" },
  { value: "fantasy", label: "Fantasy" },
];

const defaultWeightOptions: WeightOption[] = [
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

/**
 * Section for font family and weight selection.
 */
export const FontSection = memo(function FontSection({
  data,
  onChange,
  fontOptions = defaultFontOptions,
  weightOptions = defaultWeightOptions,
  disabled = false,
  className,
}: FontSectionProps) {
  const handleFamilyChange = useCallback(
    (family: string) => {
      onChange({ ...data, family });
    },
    [data, onChange],
  );

  const handleWeightChange = useCallback(
    (weight: string) => {
      onChange({ ...data, weight });
    },
    [data, onChange],
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
    <SectionLayout title="Font" className={className}>
      <FlexColumn>
        <Select
          options={fontSelectOptions}
          value={data.family}
          onChange={handleFamilyChange}
          disabled={disabled}
          aria-label="Font family"
        />
        <Select
          options={weightSelectOptions}
          value={data.weight}
          onChange={handleWeightChange}
          disabled={disabled}
          aria-label="Font weight"
        />
      </FlexColumn>
    </SectionLayout>
  );
});
