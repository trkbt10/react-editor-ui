/**
 * @file UnitDropdown component - Dropdown for selecting units
 *
 * Handles:
 * - Portal rendering
 * - Click outside to close
 * - Escape key to close
 * - Position calculation based on anchor element
 */

import { memo, useRef, useMemo, useCallback, type CSSProperties, type RefObject } from "react";
import {
  COLOR_INPUT_BORDER,
  COLOR_TEXT,
  COLOR_SURFACE_RAISED,
  COLOR_SELECTED,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
  SPACE_SM,
  SHADOW_MD,
  Z_DROPDOWN,
} from "../../themes/styles";
import { Portal } from "../Portal/Portal";
import { calculateFloatingPosition, rectToAnchor, useFloatingInteractions } from "../../hooks";
import type { UnitOption } from "./unitInputUtils";

export type UnitDropdownProps = {
  options: UnitOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  fontSize: string;
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

const DROPDOWN_MAX_HEIGHT = 200;
const DROPDOWN_MIN_WIDTH = 60;

function calculatePosition(anchorRef: RefObject<HTMLElement | null>): DropdownPosition {
  if (!anchorRef.current) {
    return { top: 0, left: 0, width: DROPDOWN_MIN_WIDTH };
  }

  const rect = anchorRef.current.getBoundingClientRect();
  const dropdownWidth = Math.max(rect.width, DROPDOWN_MIN_WIDTH);
  const anchor = rectToAnchor(rect);
  const { x, y } = calculateFloatingPosition({
    anchor,
    floatingWidth: dropdownWidth,
    floatingHeight: DROPDOWN_MAX_HEIGHT,
    placement: "bottom",
    offset: 4,
  });
  return {
    top: y,
    left: x,
    width: dropdownWidth,
  };
}

type UnitOptionItemProps = {
  option: UnitOption;
  isSelected: boolean;
  fontSize: string;
  onSelect: (value: string) => void;
};

const UnitOptionItem = memo(function UnitOptionItem({
  option,
  isSelected,
  fontSize,
  onSelect,
}: UnitOptionItemProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      padding: SPACE_SM,
      fontSize,
      color: COLOR_TEXT,
      cursor: "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      backgroundColor: isSelected ? COLOR_SELECTED : "transparent",
    }),
    [fontSize, isSelected],
  );

  const handleClick = useCallback(() => {
    onSelect(option.value);
  }, [onSelect, option.value]);

  return (
    <div
      onClick={handleClick}
      style={style}
      role="option"
      aria-selected={isSelected}
      data-testid={`unit-option-${option.value}`}
    >
      {option.label}
    </div>
  );
});

/**
 * Dropdown component for selecting units.
 * Renders in a Portal and handles click outside / escape to close.
 */
export const UnitDropdown = memo(function UnitDropdown({
  options,
  selectedValue,
  onSelect,
  onClose,
  anchorRef,
  fontSize,
}: UnitDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const position = calculatePosition(anchorRef);

  // Handle click outside and escape key
  useFloatingInteractions({
    isOpen: true, // Always open when this component is rendered
    onClose,
    anchorRef,
    floatingRef: dropdownRef,
    // No repositioning needed as position is calculated on each render
  });

  const dropdownStyle = useMemo<CSSProperties>(
    () => ({
      position: "fixed",
      top: position.top,
      left: position.left,
      minWidth: position.width,
      backgroundColor: COLOR_SURFACE_RAISED,
      border: `1px solid ${COLOR_INPUT_BORDER}`,
      borderRadius: RADIUS_SM,
      boxShadow: SHADOW_MD,
      zIndex: Z_DROPDOWN,
      padding: `${SPACE_SM} 0`,
      maxHeight: 200,
      overflowY: "auto",
    }),
    [position.top, position.left, position.width],
  );

  return (
    <Portal>
      <div
        ref={dropdownRef}
        style={dropdownStyle}
        role="listbox"
        aria-label="Select unit"
        data-testid="unit-input-dropdown"
      >
        {options.map((option) => {
          const isSelected = option.value.toLowerCase() === selectedValue.toLowerCase();
          return (
            <UnitOptionItem
              key={option.value}
              option={option}
              isSelected={isSelected}
              fontSize={fontSize}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </Portal>
  );
});
