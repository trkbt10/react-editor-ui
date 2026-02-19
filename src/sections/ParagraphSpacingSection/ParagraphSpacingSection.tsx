/**
 * @file ParagraphSpacingSection component - Paragraph spacing controls
 *
 * @description
 * Section for controlling paragraph spacing including space before,
 * space after, and hyphenation.
 *
 * @example
 * ```tsx
 * import { ParagraphSpacingSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({
 *   before: "0 pt",
 *   after: "12 pt",
 *   hyphenate: false,
 * });
 *
 * <ParagraphSpacingSection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexColumn, LabeledField } from "../shared/SectionLayouts";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import { PropertyGrid } from "../../components/PropertyGrid/PropertyGrid";
import { PropertyGridItem } from "../../components/PropertyGrid/PropertyGridItem";
import type { ParagraphSpacingSectionProps } from "./types";

const spacingUnits = [
  { value: "pt", label: "pt" },
  { value: "px", label: "px" },
  { value: "mm", label: "mm" },
  { value: "em", label: "em" },
];

/**
 * Section for paragraph spacing controls.
 */
export const ParagraphSpacingSection = memo(function ParagraphSpacingSection({
  data,
  onChange,
  disabled = false,
  className,
}: ParagraphSpacingSectionProps) {
  const handleBeforeChange = useCallback(
    (before: string) => {
      onChange({ ...data, before });
    },
    [data, onChange],
  );

  const handleAfterChange = useCallback(
    (after: string) => {
      onChange({ ...data, after });
    },
    [data, onChange],
  );

  const handleHyphenateChange = useCallback(
    (hyphenate: boolean) => {
      onChange({ ...data, hyphenate });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Paragraph Spacing" className={className}>
      <FlexColumn>
        <PropertyGrid columns={2}>
          <PropertyGridItem>
            <LabeledField label="Before">
              <UnitInput
                value={data.before}
                onChange={handleBeforeChange}
                units={spacingUnits}
                disabled={disabled}
                aria-label="Space before paragraph"
              />
            </LabeledField>
          </PropertyGridItem>
          <PropertyGridItem>
            <LabeledField label="After">
              <UnitInput
                value={data.after}
                onChange={handleAfterChange}
                units={spacingUnits}
                disabled={disabled}
                aria-label="Space after paragraph"
              />
            </LabeledField>
          </PropertyGridItem>
        </PropertyGrid>
        <Checkbox
          checked={data.hyphenate}
          onChange={handleHyphenateChange}
          disabled={disabled}
          label="Hyphenate"
        />
      </FlexColumn>
    </SectionLayout>
  );
});
