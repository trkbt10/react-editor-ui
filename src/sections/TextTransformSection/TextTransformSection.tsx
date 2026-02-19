/**
 * @file TextTransformSection component - Baseline shift and character rotation
 *
 * @description
 * Section for controlling text baseline shift and character rotation.
 *
 * @example
 * ```tsx
 * import { TextTransformSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({
 *   baselineShift: "0 pt",
 *   rotation: "0°",
 * });
 *
 * <TextTransformSection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexColumn, IconRow } from "../shared/SectionLayouts";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { BaselineShiftIcon, TextRotationIcon } from "../../icons";
import type { TextTransformSectionProps } from "./types";

const baselineUnits = [
  { value: "pt", label: "pt" },
  { value: "px", label: "px" },
  { value: "%", label: "%" },
];

const rotationUnits = [
  { value: "°", label: "°" },
];

/**
 * Section for text transform controls.
 */
export const TextTransformSection = memo(function TextTransformSection({
  data,
  onChange,
  disabled = false,
  className,
}: TextTransformSectionProps) {
  const handleBaselineShiftChange = useCallback(
    (baselineShift: string) => {
      onChange({ ...data, baselineShift });
    },
    [data, onChange],
  );

  const handleRotationChange = useCallback(
    (rotation: string) => {
      onChange({ ...data, rotation });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Transform" className={className}>
      <FlexColumn>
        <IconRow icon={<BaselineShiftIcon />}>
          <UnitInput
            value={data.baselineShift}
            onChange={handleBaselineShiftChange}
            units={baselineUnits}
            disabled={disabled}
            aria-label="Baseline shift"
          />
        </IconRow>
        <IconRow icon={<TextRotationIcon />}>
          <UnitInput
            value={data.rotation}
            onChange={handleRotationChange}
            units={rotationUnits}
            disabled={disabled}
            aria-label="Character rotation"
          />
        </IconRow>
      </FlexColumn>
    </SectionLayout>
  );
});
