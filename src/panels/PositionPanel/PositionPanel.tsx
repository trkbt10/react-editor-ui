/**
 * @file PositionPanel component - Position, alignment, constraints, and rotation settings
 */

import { memo, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { Panel } from "../../panels/Panel/Panel";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import { IconButton } from "../../components/IconButton/IconButton";
import { TransformButtons } from "../../components/TransformButtons/TransformButtons";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import { ControlGroup } from "../../components/ControlRow/ControlGroup";
import {
  ObjectHorizontalAlignSelect,
  ObjectVerticalAlignSelect,
} from "../../components/AlignmentSelect";
import { SPACE_MD } from "../../constants/styles";
import { ConstraintVisualization } from "./ConstraintVisualization";
import {
  RotationIcon,
  ConstraintToggleIcon,
  ResetIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
} from "../../icons";
import type { PositionSettings, PositionPanelProps } from "./positionTypes";

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
export { ConstraintVisualization } from "./ConstraintVisualization";
export type { ConstraintVisualizationProps } from "./ConstraintVisualization";

export const PositionPanel = memo(function PositionPanel({
  settings,
  onChange,
  onClose,
  onToggleConstraints,
  onTransformAction,
  width = 320,
  className,
}: PositionPanelProps) {
  const updateSettings = useCallback(
    <K extends keyof PositionSettings>(key: K, value: PositionSettings[K]) => {
      onChange({ ...settings, [key]: value });
    },
    [onChange, settings],
  );

  const horizontalConstraintOptions = [
    { value: "left" as const, label: "Left" },
    { value: "right" as const, label: "Right" },
    { value: "left-right" as const, label: "Left and Right" },
    { value: "center" as const, label: "Center" },
    { value: "scale" as const, label: "Scale" },
  ];

  const verticalConstraintOptions = [
    { value: "top" as const, label: "Top" },
    { value: "bottom" as const, label: "Bottom" },
    { value: "top-bottom" as const, label: "Top and Bottom" },
    { value: "center" as const, label: "Center" },
    { value: "scale" as const, label: "Scale" },
  ];

  const transformGroups = [
    {
      id: "reset",
      actions: [
        { id: "reset", icon: <ResetIcon />, label: "Reset rotation" },
      ],
    },
    {
      id: "flip",
      actions: [
        { id: "flip-horizontal", icon: <FlipHorizontalIcon />, label: "Flip horizontal" },
        { id: "flip-vertical", icon: <FlipVerticalIcon />, label: "Flip vertical" },
      ],
    },
  ];

  const handleTransformAction = useCallback(
    (actionId: string) => {
      onTransformAction?.(actionId);
    },
    [onTransformAction],
  );

  const constraintsRowStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      gap: SPACE_MD,
      alignItems: "flex-start",
    }),
    [],
  );

  const selectsColumnStyle = useMemo<CSSProperties>(
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
    <Panel title="Position" onClose={onClose} width={width} className={className}>
      <ControlGroup label="Alignment">
        <ControlRow spacer>
          <ObjectHorizontalAlignSelect
            value={settings.horizontalAlign}
            onChange={(v) => {
              updateSettings("horizontalAlign", v);
            }}
            fullWidth
          />
          <ObjectVerticalAlignSelect
            value={settings.verticalAlign}
            onChange={(v) => {
              updateSettings("verticalAlign", v);
            }}
            fullWidth
          />
        </ControlRow>
      </ControlGroup>

      <ControlGroup label="Position">
        <ControlRow
          action={
            <IconButton
              icon={<ConstraintToggleIcon />}
              aria-label="Toggle constraints"
              onClick={onToggleConstraints}
              active={false}
              size="sm"
            />
          }
        >
          <Input
            value={settings.x}
            onChange={(v) => {
              updateSettings("x", v);
            }}
            prefix="X"
            aria-label="X position"
          />
          <Input
            value={settings.y}
            onChange={(v) => {
              updateSettings("y", v);
            }}
            prefix="Y"
            aria-label="Y position"
          />
        </ControlRow>
      </ControlGroup>

      <ControlGroup label="Constraints">
        <div style={constraintsRowStyle}>
          <div style={selectsColumnStyle}>
            <Select
              options={horizontalConstraintOptions}
              value={settings.horizontalConstraint}
              onChange={(v) => {
                updateSettings("horizontalConstraint", v);
              }}
              aria-label="Horizontal constraint"
            />
            <Select
              options={verticalConstraintOptions}
              value={settings.verticalConstraint}
              onChange={(v) => {
                updateSettings("verticalConstraint", v);
              }}
              aria-label="Vertical constraint"
            />
          </div>
          <ConstraintVisualization
            horizontal={settings.horizontalConstraint}
            vertical={settings.verticalConstraint}
            onHorizontalChange={(v) => {
              updateSettings("horizontalConstraint", v);
            }}
            onVerticalChange={(v) => {
              updateSettings("verticalConstraint", v);
            }}
          />
        </div>
      </ControlGroup>

      <ControlGroup label="Rotation">
        <ControlRow
          action={
            <TransformButtons
              groups={transformGroups}
              onAction={handleTransformAction}
              size="sm"
            />
          }
        >
          <Input
            value={settings.rotation}
            onChange={(v) => {
              updateSettings("rotation", v);
            }}
            prefix={<RotationIcon />}
            suffix="°"
            aria-label="Rotation"
          />
        </ControlRow>
      </ControlGroup>
    </Panel>
  );
});
