/**
 * @file PositionSection component - X and Y position input controls
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import { Input } from "../../components/Input/Input";
import type { PositionSectionProps } from "./types";

/**
 * Section for X and Y position input controls.
 */
export const PositionSection = memo(function PositionSection({
  data,
  onChange,
  action,
  className,
}: PositionSectionProps) {
  const handleXChange = useCallback(
    (x: string) => {
      onChange({ ...data, x });
    },
    [data, onChange],
  );

  const handleYChange = useCallback(
    (y: string) => {
      onChange({ ...data, y });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Position" className={className}>
      <ControlRow action={action}>
        <Input
          value={data.x}
          onChange={handleXChange}
          prefix="X"
          aria-label="X position"
        />
        <Input
          value={data.y}
          onChange={handleYChange}
          prefix="Y"
          aria-label="Y position"
        />
      </ControlRow>
    </SectionLayout>
  );
});
