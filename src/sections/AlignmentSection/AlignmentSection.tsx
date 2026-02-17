/**
 * @file AlignmentSection component - Horizontal and vertical alignment controls
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import {
  ObjectHorizontalAlignSelect,
  ObjectVerticalAlignSelect,
  type ObjectHorizontalAlign,
  type ObjectVerticalAlign,
} from "../../components/AlignmentSelect/AlignmentSelect";
import type { AlignmentSectionProps } from "./types";

/**
 * Section for horizontal and vertical alignment controls.
 */
export const AlignmentSection = memo(function AlignmentSection({
  data,
  onChange,
  action,
  size = "sm",
  className,
}: AlignmentSectionProps) {
  const handleHorizontalChange = useCallback(
    (horizontal: ObjectHorizontalAlign) => {
      onChange({ ...data, horizontal });
    },
    [data, onChange],
  );

  const handleVerticalChange = useCallback(
    (vertical: ObjectVerticalAlign) => {
      onChange({ ...data, vertical });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Alignment" className={className}>
      <ControlRow spacer={!action} action={action}>
        <ObjectHorizontalAlignSelect
          value={data.horizontal}
          onChange={handleHorizontalChange}
          size={size}
          fullWidth
        />
        <ObjectVerticalAlignSelect
          value={data.vertical}
          onChange={handleVerticalChange}
          size={size}
          fullWidth
        />
      </ControlRow>
    </SectionLayout>
  );
});
