/**
 * @file AlignToSelect - Align target selection with tooltips
 */

import { memo, useCallback, useMemo, type CSSProperties } from "react";
import { TooltipIconButton } from "../TooltipIconButton/TooltipIconButton";
import {
  AlignToSelectionIcon,
  AlignToKeyObjectIcon,
  AlignToArtboardIcon,
} from "../../icons";
import {
  RADIUS_MD,
  SPACE_2XS,
  SPACE_XS,
} from "../../themes/styles";

export type AlignTo = "selection" | "key-object" | "artboard";

export type AlignToSelectProps = {
  value: AlignTo;
  onChange: (value: AlignTo) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  fullWidth?: boolean;
};

type OptionConfig = {
  value: AlignTo;
  icon: React.ReactNode;
  tooltip: string;
};

const options: OptionConfig[] = [
  { value: "selection", icon: <AlignToSelectionIcon />, tooltip: "Align to selection" },
  { value: "key-object", icon: <AlignToKeyObjectIcon />, tooltip: "Align to key object" },
  { value: "artboard", icon: <AlignToArtboardIcon />, tooltip: "Align to artboard" },
];

const containerBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  backgroundColor: "var(--rei-color-surface-overlay, #f3f4f6)",
  borderRadius: RADIUS_MD,
  gap: SPACE_2XS,
  padding: SPACE_XS,
  boxSizing: "border-box",
};

type AlignToButtonProps = {
  option: OptionConfig;
  isSelected: boolean;
  disabled: boolean;
  size: "sm" | "md";
  onChange: (value: AlignTo) => void;
};

const AlignToButton = memo(function AlignToButton({
  option,
  isSelected,
  disabled,
  size,
  onChange,
}: AlignToButtonProps) {
  const handleClick = useCallback(() => {
    onChange(option.value);
  }, [onChange, option.value]);

  return (
    <TooltipIconButton
      icon={option.icon}
      tooltip={option.tooltip}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      variant={isSelected ? "selected" : "ghost"}
      aria-pressed={isSelected}
    />
  );
});

/** Segmented control for align target with tooltips: selection, key object, or artboard */
export const AlignToSelect = memo(function AlignToSelect({
  value,
  onChange,
  disabled = false,
  size = "md",
  fullWidth = false,
}: AlignToSelectProps) {
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      ...containerBaseStyle,
      width: fullWidth ? "100%" : "auto",
    }),
    [fullWidth],
  );

  return (
    <div style={containerStyle} role="group" aria-label="Align to target">
      {options.map((option) => (
        <AlignToButton
          key={option.value}
          option={option}
          isSelected={value === option.value}
          disabled={disabled}
          size={size}
          onChange={onChange}
        />
      ))}
    </div>
  );
});
