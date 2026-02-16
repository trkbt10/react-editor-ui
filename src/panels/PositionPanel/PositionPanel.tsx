/**
 * @file PositionPanel component - Position, alignment, constraints, and rotation settings
 */

import { memo, useCallback, useMemo } from "react";
import type { CSSProperties } from "react";
import { Panel } from "../../panels/Panel/Panel";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";
import { Input } from "../../components/Input/Input";
import { Select } from "../../components/Select/Select";
import { IconButton } from "../../components/IconButton/IconButton";
import { TransformButtons } from "../../components/TransformButtons/TransformButtons";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import { ControlGroup } from "../../components/ControlRow/ControlGroup";
import { SPACE_MD } from "../../constants/styles";
import { ConstraintVisualization } from "./ConstraintVisualization";
import {
  AlignLeftIcon,
  AlignCenterHIcon,
  AlignRightIcon,
  AlignTopIcon,
  AlignMiddleIcon,
  AlignBottomIcon,
  RotationIcon,
  ConstraintToggleIcon,
  ResetIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
} from "../../icons";
import type {
  PositionSettings,
  PositionPanelProps,
  HorizontalAlign,
  VerticalAlign,
} from "./positionTypes";

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

  const horizontalAlignOptions = [
    { value: "left" as const, icon: <AlignLeftIcon />, "aria-label": "Align left" },
    { value: "center" as const, icon: <AlignCenterHIcon />, "aria-label": "Align center" },
    { value: "right" as const, icon: <AlignRightIcon />, "aria-label": "Align right" },
  ];

  const verticalAlignOptions = [
    { value: "top" as const, icon: <AlignTopIcon />, "aria-label": "Align top" },
    { value: "middle" as const, icon: <AlignMiddleIcon />, "aria-label": "Align middle" },
    { value: "bottom" as const, icon: <AlignBottomIcon />, "aria-label": "Align bottom" },
  ];

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
          <SegmentedControl
            options={horizontalAlignOptions}
            value={settings.horizontalAlign}
            onChange={(v) => {
              updateSettings("horizontalAlign", v as HorizontalAlign);
            }}
            fullWidth
            aria-label="Horizontal alignment"
          />
          <SegmentedControl
            options={verticalAlignOptions}
            value={settings.verticalAlign}
            onChange={(v) => {
              updateSettings("verticalAlign", v as VerticalAlign);
            }}
            fullWidth
            aria-label="Vertical alignment"
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
