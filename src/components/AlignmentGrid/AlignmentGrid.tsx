/**
 * @file AlignmentGrid component - 9-point alignment selector grid
 */

import { memo, useMemo, useCallback, type CSSProperties, type PointerEvent, type KeyboardEvent } from "react";
import {
  COLOR_BORDER,
  COLOR_TEXT_MUTED,
  COLOR_PRIMARY,
  COLOR_HOVER,
  COLOR_SURFACE,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";
import type { AlignmentType } from "./types";

export type AlignmentGridProps = {
  value: AlignmentType;
  onChange: (value: AlignmentType) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

const alignmentOptions: AlignmentType[] = [
  "top-left", "top", "top-right",
  "left", "center", "right",
  "bottom-left", "bottom", "bottom-right",
];

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "2px",
  width: "60px",
  height: "60px",
  padding: "2px",
  borderRadius: RADIUS_SM,
  backgroundColor: COLOR_SURFACE,
  border: `1px solid ${COLOR_BORDER}`,
};

const dotBaseStyle: CSSProperties = {
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: "currentColor",
};

const dotSelectedStyle: CSSProperties = {
  ...dotBaseStyle,
  color: "#fff",
};

const dotUnselectedStyle: CSSProperties = {
  ...dotBaseStyle,
  color: COLOR_TEXT_MUTED,
};

type AlignmentCellProps = {
  alignment: AlignmentType;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (alignment: AlignmentType) => void;
};

const AlignmentCell = memo(function AlignmentCell({
  alignment,
  isSelected,
  disabled,
  onSelect,
}: AlignmentCellProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isSelected ? COLOR_PRIMARY : "transparent",
      borderRadius: "2px",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      opacity: disabled ? 0.5 : 1,
    }),
    [isSelected, disabled],
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelect(alignment);
    }
  }, [disabled, onSelect, alignment]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!disabled && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onSelect(alignment);
      }
    },
    [disabled, onSelect, alignment],
  );

  const handlePointerEnter = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled || isSelected) {
        return;
      }
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    },
    [disabled, isSelected],
  );

  const handlePointerLeave = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }
      e.currentTarget.style.backgroundColor = isSelected ? COLOR_PRIMARY : "transparent";
    },
    [disabled, isSelected],
  );

  return (
    <div
      role="radio"
      aria-checked={isSelected}
      aria-label={alignment.replace("-", " ")}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={style}
    >
      <div style={isSelected ? dotSelectedStyle : dotUnselectedStyle} />
    </div>
  );
});

/**
 * 9-point alignment grid selector (top-left, top, top-right, etc.).
 */
export const AlignmentGrid = memo(function AlignmentGrid({
  value,
  onChange,
  disabled = false,
  "aria-label": ariaLabel = "Alignment",
}: AlignmentGridProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={gridStyle}
    >
      {alignmentOptions.map((alignment) => (
        <AlignmentCell
          key={alignment}
          alignment={alignment}
          isSelected={value === alignment}
          disabled={disabled}
          onSelect={onChange}
        />
      ))}
    </div>
  );
});
