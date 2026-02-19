/**
 * @file IndentSection component - Paragraph indent controls
 *
 * @description
 * Section for controlling paragraph indentation including left, right,
 * and first line indents.
 *
 * @example
 * ```tsx
 * import { IndentSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({
 *   left: "0 pt",
 *   right: "0 pt",
 *   firstLine: "0 pt",
 * });
 *
 * <IndentSection data={data} onChange={setData} />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexColumn, FlexGroup, LabeledField } from "../shared/SectionLayouts";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { TooltipIconButton } from "../../components/TooltipIconButton/TooltipIconButton";
import { PropertyGrid } from "../../components/PropertyGrid/PropertyGrid";
import { PropertyGridItem } from "../../components/PropertyGrid/PropertyGridItem";
import { IndentIncreaseIcon, IndentDecreaseIcon } from "../../icons";
import type { IndentSectionProps } from "./types";

const indentUnits = [
  { value: "pt", label: "pt" },
  { value: "px", label: "px" },
  { value: "mm", label: "mm" },
  { value: "in", label: "in" },
];

/**
 * Section for paragraph indent controls.
 */
export const IndentSection = memo(function IndentSection({
  data,
  onChange,
  onIncrease,
  onDecrease,
  disabled = false,
  size = "md",
  className,
}: IndentSectionProps) {
  const handleLeftChange = useCallback(
    (left: string) => {
      onChange({ ...data, left });
    },
    [data, onChange],
  );

  const handleRightChange = useCallback(
    (right: string) => {
      onChange({ ...data, right });
    },
    [data, onChange],
  );

  const handleFirstLineChange = useCallback(
    (firstLine: string) => {
      onChange({ ...data, firstLine });
    },
    [data, onChange],
  );

  const handleIncrease = useCallback(() => {
    onIncrease?.();
  }, [onIncrease]);

  const handleDecrease = useCallback(() => {
    onDecrease?.();
  }, [onDecrease]);

  return (
    <SectionLayout title="Indent" className={className}>
      <FlexColumn>
        <FlexGroup>
          <TooltipIconButton
            icon={<IndentDecreaseIcon />}
            tooltip="Decrease indent"
            size={size}
            onClick={handleDecrease}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<IndentIncreaseIcon />}
            tooltip="Increase indent"
            size={size}
            onClick={handleIncrease}
            disabled={disabled}
          />
        </FlexGroup>
        <PropertyGrid columns={2}>
          <PropertyGridItem>
            <LabeledField label="Left">
              <UnitInput
                value={data.left}
                onChange={handleLeftChange}
                units={indentUnits}
                disabled={disabled}
                aria-label="Left indent"
              />
            </LabeledField>
          </PropertyGridItem>
          <PropertyGridItem>
            <LabeledField label="Right">
              <UnitInput
                value={data.right}
                onChange={handleRightChange}
                units={indentUnits}
                disabled={disabled}
                aria-label="Right indent"
              />
            </LabeledField>
          </PropertyGridItem>
        </PropertyGrid>
        <LabeledField label="First Line">
          <UnitInput
            value={data.firstLine}
            onChange={handleFirstLineChange}
            units={indentUnits}
            disabled={disabled}
            aria-label="First line indent"
          />
        </LabeledField>
      </FlexColumn>
    </SectionLayout>
  );
});
