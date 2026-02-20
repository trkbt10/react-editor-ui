/**
 * @file Color Operation Button for SelectionToolbar
 *
 * A button that opens a ColorPicker dropdown when clicked.
 * Used in SelectionToolbar for text color selection.
 */

import {
  memo,
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import type { CSSProperties, MouseEvent, PointerEvent } from "react";
import { IconButton } from "../../../components/IconButton/IconButton";
import { Tooltip } from "../../../components/Tooltip/Tooltip";
import { Portal } from "../../../components/Portal/Portal";
import { ColorPicker } from "../../../components/ColorPicker/ColorPicker";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  RADIUS_MD,
  SHADOW_LG,
  SPACE_SM,
  Z_POPOVER,
} from "../../../themes/styles";

// =============================================================================
// Types
// =============================================================================

export type ColorOperationButtonProps = {
  /** Current text color (displayed in the button indicator) */
  readonly currentColor?: string;
  /** Called when a color is selected */
  readonly onColorSelect: (color: string) => void;
  /** Button label for accessibility */
  readonly label?: string;
  /** Keyboard shortcut hint */
  readonly shortcut?: string;
  /** Whether the button is disabled */
  readonly disabled?: boolean;
};

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_COLOR = "#000000";

/** Prevent text deselection */
const handlePointerDown = (e: PointerEvent) => {
  e.preventDefault();
};

// =============================================================================
// Styles
// =============================================================================

const dropdownStyle: CSSProperties = {
  position: "fixed",
  zIndex: Z_POPOVER + 1,
  backgroundColor: COLOR_SURFACE,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: RADIUS_MD,
  boxShadow: SHADOW_LG,
  padding: SPACE_SM,
};

// =============================================================================
// Icon
// =============================================================================

type TextColorIconProps = {
  readonly color: string;
};

const TextColorIcon = memo(function TextColorIcon({ color }: TextColorIconProps) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Letter "A" */}
      <path d="M5 20L12 4L19 20" />
      <path d="M8 14H16" />
      {/* Color indicator bar */}
      <rect x="4" y="21" width="16" height="2" fill={color} stroke="none" />
    </svg>
  );
});

// =============================================================================
// Component
// =============================================================================

/**
 * Color selection button with dropdown ColorPicker.
 * Designed for use in SelectionToolbar.
 */
export const ColorOperationButton = memo(function ColorOperationButton({
  currentColor = DEFAULT_COLOR,
  onColorSelect,
  label = "Text Color",
  shortcut,
  disabled = false,
}: ColorOperationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });

  // Calculate dropdown position relative to button
  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 280; // Approximate ColorPicker height

      // Position below button by default, flip above if not enough space
      const spaceBelow = viewportHeight - rect.bottom;
      const y = spaceBelow >= dropdownHeight + 8
        ? rect.bottom + 4
        : rect.top - dropdownHeight - 4;

      setDropdownPosition({
        x: rect.left,
        y,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useLayoutEffect(() => {
    if (!isOpen) {return;}

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsOpen((prev) => !prev);
    },
    [],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      onColorSelect(color);
      setIsOpen(false);
    },
    [onColorSelect],
  );

  const tooltipContent = useMemo(
    () => (shortcut ? `${label} (${shortcut})` : label),
    [label, shortcut],
  );

  const icon = useMemo(
    () => <TextColorIcon color={currentColor} />,
    [currentColor],
  );

  const positionedDropdownStyle = useMemo<CSSProperties>(
    () => ({
      ...dropdownStyle,
      left: dropdownPosition.x,
      top: dropdownPosition.y,
    }),
    [dropdownPosition.x, dropdownPosition.y],
  );

  return (
    <>
      <Tooltip content={tooltipContent} placement="top" delay={400}>
        <IconButton
          ref={buttonRef}
          icon={icon}
          aria-label={label}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          size="sm"
          variant="default"
          disabled={disabled}
          onClick={handleClick}
        />
      </Tooltip>

      {isOpen && (
        <Portal>
          <div
            ref={dropdownRef}
            style={positionedDropdownStyle}
            onPointerDown={handlePointerDown}
            role="dialog"
            aria-label="Color picker"
          >
            <ColorPicker
              value={currentColor}
              onChange={handleColorChange}
              aria-label="Select text color"
            />
          </div>
        </Portal>
      )}
    </>
  );
});
