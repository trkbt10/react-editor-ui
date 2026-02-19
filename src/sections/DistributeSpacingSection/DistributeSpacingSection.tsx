/**
 * @file DistributeSpacingSection component - Spacing distribution controls
 *
 * @description
 * Section for distributing spacing between objects with controls for
 * horizontal/vertical spacing and align-to target selection.
 *
 * @example
 * ```tsx
 * import { DistributeSpacingSection } from "react-editor-ui/sections";
 *
 * const [data, setData] = useState({
 *   horizontal: false,
 *   vertical: false,
 *   spacing: "0 pt",
 *   alignTo: "selection" as const,
 * });
 *
 * <DistributeSpacingSection
 *   data={data}
 *   onChange={setData}
 *   onApplyHorizontal={() => console.log("Apply H spacing")}
 *   onApplyVertical={() => console.log("Apply V spacing")}
 * />
 * ```
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { FlexColumn, FlexRow, LabelRow } from "../shared/SectionLayouts";
import { TooltipIconButton } from "../../components/TooltipIconButton/TooltipIconButton";
import { UnitInput } from "../../components/UnitInput/UnitInput";
import { AlignToSelect, type AlignTo } from "../../components/AlignmentSelect/AlignmentSelect";
import { SpaceHorizontalIcon, SpaceVerticalIcon } from "../../icons";
import type { DistributeSpacingSectionProps } from "./types";

const spacingUnits = [
  { value: "pt", label: "pt" },
  { value: "px", label: "px" },
  { value: "mm", label: "mm" },
];

/**
 * Section for spacing distribution controls.
 */
export const DistributeSpacingSection = memo(function DistributeSpacingSection({
  data,
  onChange,
  onApplyHorizontal,
  onApplyVertical,
  disabled = false,
  size = "md",
  className,
}: DistributeSpacingSectionProps) {
  const handleSpacingChange = useCallback(
    (spacing: string) => {
      onChange({ ...data, spacing });
    },
    [data, onChange],
  );

  const handleAlignToChange = useCallback(
    (alignTo: AlignTo) => {
      onChange({ ...data, alignTo });
    },
    [data, onChange],
  );

  const handleApplyHorizontal = useCallback(() => {
    onApplyHorizontal?.();
  }, [onApplyHorizontal]);

  const handleApplyVertical = useCallback(() => {
    onApplyVertical?.();
  }, [onApplyVertical]);

  return (
    <SectionLayout title="Distribute Spacing" className={className}>
      <FlexColumn>
        <FlexRow>
          <TooltipIconButton
            icon={<SpaceHorizontalIcon />}
            tooltip="Distribute horizontal spacing"
            size={size}
            onClick={handleApplyHorizontal}
            disabled={disabled}
          />
          <TooltipIconButton
            icon={<SpaceVerticalIcon />}
            tooltip="Distribute vertical spacing"
            size={size}
            onClick={handleApplyVertical}
            disabled={disabled}
          />
          <UnitInput
            value={data.spacing}
            onChange={handleSpacingChange}
            units={spacingUnits}
            disabled={disabled}
            aria-label="Spacing value"
          />
        </FlexRow>
        <LabelRow label="Align To:">
          <AlignToSelect
            value={data.alignTo}
            onChange={handleAlignToChange}
            size={size}
            disabled={disabled}
          />
        </LabelRow>
      </FlexColumn>
    </SectionLayout>
  );
});
