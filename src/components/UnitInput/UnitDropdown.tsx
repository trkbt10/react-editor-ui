/**
 * @file UnitDropdown component - Dropdown for selecting units
 *
 * Handles:
 * - Portal rendering
 * - Click outside to close
 * - Escape key to close
 * - Position calculation based on anchor element
 */

import { useRef, useEffect, useCallback, type CSSProperties, type RefObject } from "react";
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
} from "../../constants/styles";
import { Portal } from "../Portal/Portal";
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

function calculatePosition(anchorRef: RefObject<HTMLElement | null>): DropdownPosition {
  if (!anchorRef.current) {
    return { top: 0, left: 0, width: 60 };
  }

  const rect = anchorRef.current.getBoundingClientRect();
  return {
    top: rect.bottom + window.scrollY + 4,
    left: rect.left + window.scrollX,
    width: Math.max(rect.width, 60),
  };
}

/**
 * Dropdown component for selecting units.
 * Renders in a Portal and handles click outside / escape to close.
 */
export function UnitDropdown({
  options,
  selectedValue,
  onSelect,
  onClose,
  anchorRef,
  fontSize,
}: UnitDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const position = calculatePosition(anchorRef);

  // Close on pointer outside (supports both mouse and touch)
  useEffect(() => {
    const handlePointerOutside = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        anchorRef.current &&
        !anchorRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [anchorRef, onClose]);

  const handleSelect = useCallback(
    (value: string) => {
      onSelect(value);
    },
    [onSelect],
  );

  const dropdownStyle: CSSProperties = {
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
  };

  const itemStyle: CSSProperties = {
    padding: SPACE_SM,
    fontSize,
    color: COLOR_TEXT,
    cursor: "pointer",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  };

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
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              style={{
                ...itemStyle,
                backgroundColor: isSelected ? COLOR_SELECTED : "transparent",
              }}
              role="option"
              aria-selected={isSelected}
              data-testid={`unit-option-${option.value}`}
            >
              {option.label}
            </div>
          );
        })}
      </div>
    </Portal>
  );
}
