/**
 * @file TextScaleSection component - Vertical and horizontal text scaling
 *
 * @description
 * Section for controlling text vertical and horizontal scaling percentages.
 *
 * @example
 * ```tsx
 * import { TextScaleSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({
 *   vertical: "100%",
 *   horizontal: "100%",
 * });
 *
 * <TextScaleSection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexColumn, IconRow } from "../shared/SectionLayouts";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { ScaleVerticalIcon, ScaleHorizontalIcon } from "../../icons";
import type { TextScaleSectionProps } from "./types";

const scaleUnits = [
  { value: "%", label: "%" },
];

/**
 * Section for text scale controls.
 */
export const TextScaleSection = memo(function TextScaleSection({
  data,
  onChange,
  disabled = false,
  className,
}: TextScaleSectionProps) {
  const handleVerticalChange = useCallback(
    (vertical: string) => {
      onChange({ ...data, vertical });
    },
    [data, onChange],
  );

  const handleHorizontalChange = useCallback(
    (horizontal: string) => {
      onChange({ ...data, horizontal });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Scale" className={className}>
      <FlexColumn>
        <IconRow icon={<ScaleVerticalIcon />}>
          <UnitInput
            value={data.vertical}
            onChange={handleVerticalChange}
            units={scaleUnits}
            disabled={disabled}
            aria-label="Vertical scale"
          />
        </IconRow>
        <IconRow icon={<ScaleHorizontalIcon />}>
          <UnitInput
            value={data.horizontal}
            onChange={handleHorizontalChange}
            units={scaleUnits}
            disabled={disabled}
            aria-label="Horizontal scale"
          />
        </IconRow>
      </FlexColumn>
    </SectionLayout>
  );
});
