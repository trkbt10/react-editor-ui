/**
 * @file PositionPanel component - Position, alignment, constraints, and rotation settings
 *
 * @description
 * A comprehensive panel for object positioning with alignment controls, X/Y inputs,
 * constraint settings, and rotation. Combines multiple property sections into
 * a unified panel for design tool inspectors.
 *
 * @example
 * ```tsx
 * import { PositionPanel, createDefaultPositionSettings } from "react-editor-ui/panels/PositionPanel";
 *
 * const [settings, setSettings] = useState(createDefaultPositionSettings());
 *
 * <PositionPanel
 *   settings={settings}
 *   onChange={setSettings}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */

import { memo, useCallback, useMemo } from "react";
import { Panel } from "../../panels/Panel/Panel";
import { IconButton } from "../../components/IconButton/IconButton";
import { AlignmentSection } from "../../sections/AlignmentSection/AlignmentSection";
import { PositionSection } from "../../sections/PositionSection/PositionSection";
import { ConstraintsSection } from "../../sections/ConstraintsSection/ConstraintsSection";
import { RotationSection } from "../../sections/RotationSection/RotationSection";
import { ConstraintToggleIcon } from "../../icons";
import type { AlignmentData } from "../../sections/AlignmentSection/types";
import type { PositionData } from "../../sections/PositionSection/types";
import type { ConstraintsData } from "../../sections/ConstraintsSection/types";
import type { RotationData } from "../../sections/RotationSection/types";
import type { PositionPanelProps } from "./positionTypes";

// Re-export types and utilities for external use
export type {
  PositionSettings,
  PositionPanelProps,
  HorizontalAlign,
  VerticalAlign,
  HorizontalConstraint,
  VerticalConstraint,
} from "./positionTypes";

export { createDefaultPositionSettings } from "./positionTypes";

/**
 * Position panel with alignment, position, constraints, and rotation controls.
 */
export const PositionPanel = memo(function PositionPanel({
  settings,
  onChange,
  onClose,
  onToggleConstraints,
  onTransformAction,
  width = 320,
  className,
}: PositionPanelProps) {
  // Alignment data and handler
  const alignmentData = useMemo<AlignmentData>(
    () => ({
      horizontal: settings.horizontalAlign,
      vertical: settings.verticalAlign === "middle" ? "middle" : settings.verticalAlign === "bottom" ? "bottom" : "top",
    }),
    [settings.horizontalAlign, settings.verticalAlign],
  );

  const handleAlignmentChange = useCallback(
    (data: AlignmentData) => {
      onChange({
        ...settings,
        horizontalAlign: data.horizontal,
        verticalAlign: data.vertical,
      });
    },
    [onChange, settings],
  );

  // Position data and handler
  const positionData = useMemo<PositionData>(
    () => ({
      x: settings.x,
      y: settings.y,
    }),
    [settings.x, settings.y],
  );

  const handlePositionChange = useCallback(
    (data: PositionData) => {
      onChange({
        ...settings,
        x: data.x,
        y: data.y,
      });
    },
    [onChange, settings],
  );

  // Constraints data and handler
  const constraintsData = useMemo<ConstraintsData>(
    () => ({
      horizontal: settings.horizontalConstraint,
      vertical: settings.verticalConstraint,
    }),
    [settings.horizontalConstraint, settings.verticalConstraint],
  );

  const handleConstraintsChange = useCallback(
    (data: ConstraintsData) => {
      onChange({
        ...settings,
        horizontalConstraint: data.horizontal,
        verticalConstraint: data.vertical,
      });
    },
    [onChange, settings],
  );

  // Rotation data and handler
  const rotationData = useMemo<RotationData>(
    () => ({
      rotation: settings.rotation,
    }),
    [settings.rotation],
  );

  const handleRotationChange = useCallback(
    (data: RotationData) => {
      onChange({
        ...settings,
        rotation: data.rotation,
      });
    },
    [onChange, settings],
  );

  const positionAction = useMemo(
    () => (
      <IconButton
        icon={<ConstraintToggleIcon />}
        aria-label="Toggle constraints"
        onClick={onToggleConstraints}
        active={false}
        size="sm"
      />
    ),
    [onToggleConstraints],
  );

  return (
    <Panel title="Position" onClose={onClose} width={width} className={className}>
      <AlignmentSection data={alignmentData} onChange={handleAlignmentChange} />

      <PositionSection
        data={positionData}
        onChange={handlePositionChange}
        action={positionAction}
      />

      <ConstraintsSection data={constraintsData} onChange={handleConstraintsChange} />

      <RotationSection
        data={rotationData}
        onChange={handleRotationChange}
        onTransformAction={onTransformAction}
      />
    </Panel>
  );
});
