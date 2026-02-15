/**
 * @file PositionPanel component - Position, alignment, constraints, and rotation settings
 */

import type { ReactNode, CSSProperties } from "react";
import { Panel } from "../Panel/Panel";
import { SegmentedControl } from "../SegmentedControl/SegmentedControl";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";
import { IconButton } from "../IconButton/IconButton";
import { TransformButtons } from "../TransformButtons/TransformButtons";
import {
  COLOR_TEXT_MUTED,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
} from "../../constants/styles";
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
} from "./positionIcons";
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

// ========================================
// SECTION LABEL
// ========================================

function SectionLabel({ children }: { children: ReactNode }) {
  const style: CSSProperties = {
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
    marginBottom: SPACE_SM,
  };
  return <div style={style}>{children}</div>;
}

// ========================================
// MAIN COMPONENT
// ========================================

export function PositionPanel({
  settings,
  onChange,
  onClose,
  onToggleConstraints,
  onTransformAction,
  width = 320,
  className,
}: PositionPanelProps) {
  const updateSettings = <K extends keyof PositionSettings>(
    key: K,
    value: PositionSettings[K],
  ) => {
    onChange({ ...settings, [key]: value });
  };

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

  const handleTransformAction = (actionId: string) => {
    onTransformAction?.(actionId);
  };

  const rowStyle: CSSProperties = {
    display: "flex",
    gap: SPACE_MD,
    alignItems: "center",
  };

  const sectionStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_SM,
  };

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: SPACE_MD,
  };

  const constraintsRowStyle: CSSProperties = {
    display: "flex",
    gap: SPACE_MD,
    alignItems: "flex-start",
  };

  const selectsColumnStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: SPACE_MD,
    flex: 1,
  };

  const rotationRowStyle: CSSProperties = {
    display: "flex",
    gap: SPACE_MD,
    alignItems: "center",
  };

  return (
    <Panel title="Position" onClose={onClose} width={width} className={className}>
      {/* Alignment Section */}
      <div style={sectionStyle}>
        <SectionLabel>Alignment</SectionLabel>
        <div style={rowStyle}>
          <SegmentedControl
            options={horizontalAlignOptions}
            value={settings.horizontalAlign}
            onChange={(v) => {
              updateSettings("horizontalAlign", v as HorizontalAlign);
            }}
            aria-label="Horizontal alignment"
          />
          <SegmentedControl
            options={verticalAlignOptions}
            value={settings.verticalAlign}
            onChange={(v) => {
              updateSettings("verticalAlign", v as VerticalAlign);
            }}
            aria-label="Vertical alignment"
          />
        </div>
      </div>

      {/* Position Section */}
      <div style={sectionStyle}>
        <SectionLabel>Position</SectionLabel>
        <div style={rowStyle}>
          <div style={{ ...gridStyle, flex: 1, minWidth: 0 }}>
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
          </div>
          <IconButton
            icon={<ConstraintToggleIcon />}
            aria-label="Toggle constraints"
            onClick={onToggleConstraints}
            active={false}
          />
        </div>
      </div>

      {/* Constraints Section */}
      <div style={sectionStyle}>
        <SectionLabel>Constraints</SectionLabel>
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
          />
        </div>
      </div>

      {/* Rotation Section */}
      <div style={sectionStyle}>
        <SectionLabel>Rotation</SectionLabel>
        <div style={rotationRowStyle}>
          <div style={{ flex: 1 }}>
            <Input
              value={settings.rotation}
              onChange={(v) => {
                updateSettings("rotation", v);
              }}
              prefix={<RotationIcon />}
              suffix="°"
              aria-label="Rotation"
            />
          </div>
          <TransformButtons
            groups={transformGroups}
            onAction={handleTransformAction}
            size="sm"
          />
        </div>
      </div>
    </Panel>
  );
}
