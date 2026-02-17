/**
 * @file FramePresetPicker - Dropdown for selecting frame presets
 */

import { memo, useMemo, useCallback, useState } from "react";
import { LuFrame } from "react-icons/lu";

import { SplitButton, type SplitButtonCategory } from "../../../../../components/SplitButton/SplitButton";
import { Tooltip } from "../../../../../components/Tooltip/Tooltip";
import type { FramePreset } from "../types";
import { framePresets, framePresetCategories } from "../mockData";

// =============================================================================
// Component
// =============================================================================

type FramePresetPickerProps = {
  onSelect: (preset: FramePreset) => void;
  /** Called when main button is clicked to enter drawing mode */
  onDrawMode?: () => void;
  /** Whether the frame drawing tool is currently active */
  isDrawMode?: boolean;
};

export const FramePresetPicker = memo(function FramePresetPicker({
  onSelect,
  onDrawMode,
  isDrawMode = false,
}: FramePresetPickerProps) {
  // Track selected preset for SplitButton (defaults to first preset)
  const [selectedPreset, setSelectedPreset] = useState<FramePreset>("a4");

  // Convert framePresetCategories to SplitButtonCategory format
  const categories = useMemo((): SplitButtonCategory<FramePreset>[] => {
    return framePresetCategories.map((cat) => ({
      id: cat.id,
      label: cat.label,
      options: cat.presets.map((preset) => {
        const info = framePresets[preset];
        return {
          value: preset,
          label: info.label,
          icon: <LuFrame size={16} />,
          shortcut: `${info.width} × ${info.height}`,
        };
      }),
    }));
  }, []);

  const handleChange = useCallback((preset: FramePreset) => {
    setSelectedPreset(preset);
    onSelect(preset);
  }, [onSelect]);

  const handleAction = useCallback(() => {
    if (onDrawMode) {
      onDrawMode();
    }
  }, [onDrawMode]);

  return (
    <Tooltip content="Add Frame (F)" placement="top">
      <SplitButton
        categories={categories}
        value={selectedPreset}
        onChange={handleChange}
        onAction={handleAction}
        size="lg"
        variant={isDrawMode ? "selected" : "default"}
        aria-label="Draw Frame"
      />
    </Tooltip>
  );
});
