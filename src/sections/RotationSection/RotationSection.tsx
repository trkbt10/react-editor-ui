/**
 * @file RotationSection component - Rotation input with optional transform buttons
 */

import { memo, useCallback, useMemo } from "react";
import { SectionLayout } from "../shared/SectionLayout";
import { ControlRow } from "../../components/ControlRow/ControlRow";
import { Input } from "../../components/Input/Input";
import { TransformButtons } from "../../components/TransformButtons/TransformButtons";
import { RotationIcon, ResetIcon, FlipHorizontalIcon, FlipVerticalIcon } from "../../icons";
import type { RotationSectionProps } from "./types";

const defaultTransformGroups = [
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

/**
 * Section for rotation input with optional transform action buttons.
 */
export const RotationSection = memo(function RotationSection({
  data,
  onChange,
  onTransformAction,
  showTransformButtons = true,
  action,
  className,
}: RotationSectionProps) {
  const handleRotationChange = useCallback(
    (rotation: string) => {
      onChange({ rotation });
    },
    [onChange],
  );

  const handleTransformAction = useCallback(
    (actionId: string) => {
      onTransformAction?.(actionId);
    },
    [onTransformAction],
  );

  const transformButtons = useMemo(() => {
    if (!showTransformButtons || !onTransformAction) {
      return null;
    }
    return (
      <TransformButtons
        groups={defaultTransformGroups}
        onAction={handleTransformAction}
        size="sm"
      />
    );
  }, [showTransformButtons, onTransformAction, handleTransformAction]);

  const panelAction = action ?? transformButtons;

  return (
    <SectionLayout title="Rotation" className={className}>
      <ControlRow action={panelAction}>
        <Input
          value={data.rotation}
          onChange={handleRotationChange}
          prefix={<RotationIcon />}
          suffix="°"
          aria-label="Rotation"
        />
      </ControlRow>
    </SectionLayout>
  );
});
