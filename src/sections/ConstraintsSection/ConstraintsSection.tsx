/**
 * @file ConstraintsSection component - Horizontal and vertical constraint controls
 */

import { memo, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { Select, type SelectOption } from "../../components/Select/Select";
import { SPACE_MD } from "../../themes/styles";
import { ConstraintVisualization } from "./ConstraintVisualization";
import type { ConstraintsSectionProps, HorizontalConstraint, VerticalConstraint } from "./types";

const horizontalConstraintOptions: SelectOption<HorizontalConstraint>[] = [
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "left-right", label: "Left and Right" },
  { value: "center", label: "Center" },
  { value: "scale", label: "Scale" },
];

const verticalConstraintOptions: SelectOption<VerticalConstraint>[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "top-bottom", label: "Top and Bottom" },
  { value: "center", label: "Center" },
  { value: "scale", label: "Scale" },
];

/**
 * Section for horizontal and vertical constraint controls with visualization.
 */
export const ConstraintsSection = memo(function ConstraintsSection({
  data,
  onChange,
  className,
}: ConstraintsSectionProps) {
  const handleHorizontalChange = useCallback(
    (horizontal: HorizontalConstraint) => {
      onChange({ ...data, horizontal });
    },
    [data, onChange],
  );

  const handleVerticalChange = useCallback(
    (vertical: VerticalConstraint) => {
      onChange({ ...data, vertical });
    },
    [data, onChange],
  );

  const rowStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      gap: SPACE_MD,
      alignItems: "flex-start",
    }),
    [],
  );

  const selectsStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: SPACE_MD,
      flex: 1,
      minWidth: 0,
    }),
    [],
  );

  return (
    <SectionLayout title="Constraints" className={className}>
      <div style={rowStyle}>
        <div style={selectsStyle}>
          <Select
            options={horizontalConstraintOptions}
            value={data.horizontal}
            onChange={handleHorizontalChange}
            aria-label="Horizontal constraint"
          />
          <Select
            options={verticalConstraintOptions}
            value={data.vertical}
            onChange={handleVerticalChange}
            aria-label="Vertical constraint"
          />
        </div>
        <ConstraintVisualization
          horizontal={data.horizontal}
          vertical={data.vertical}
          onHorizontalChange={handleHorizontalChange}
          onVerticalChange={handleVerticalChange}
        />
      </div>
    </SectionLayout>
  );
});
