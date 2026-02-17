/**
 * @file SizeSection component - Width and height input controls
 */

import { memo, useCallback } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import { Input } from "../../components/Input/Input";
import type { SizeSectionProps } from "./types";

/**
 * Section for width and height input controls.
 */
export const SizeSection = memo(function SizeSection({
  data,
  onChange,
  action,
  className,
}: SizeSectionProps) {
  const handleWidthChange = useCallback(
    (width: string) => {
      onChange({ ...data, width });
    },
    [data, onChange],
  );

  const handleHeightChange = useCallback(
    (height: string) => {
      onChange({ ...data, height });
    },
    [data, onChange],
  );

  return (
    <SectionLayout title="Size" className={className}>
      <ControlRow action={action}>
        <Input
          value={data.width}
          onChange={handleWidthChange}
          prefix="W"
          aria-label="Width"
        />
        <Input
          value={data.height}
          onChange={handleHeightChange}
          prefix="H"
          aria-label="Height"
        />
      </ControlRow>
    </SectionLayout>
  );
});
