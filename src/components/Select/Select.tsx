/**
 * @file Select component - Dropdown selection with portal rendering
 *
 * @description
 * Dropdown select with keyboard navigation and portal-based rendering.
 * Supports custom option rendering and disabled states.
 *
 * @example
 * ```tsx
 * import { Select } from "react-editor-ui/Select";
 *
 * const options = [
 *   { value: "small", label: "Small" },
 *   { value: "medium", label: "Medium" },
 *   { value: "large", label: "Large" },
 * ];
 *
 * <Select
 *   value="medium"
 *   options={options}
 *   onChange={(value) => console.log(value)}
 * />
 * ```
 */

import React, { memo, useState, useRef, useEffectEvent, useLayoutEffect, useCallback, useMemo, type CSSProperties, type ReactNode } from "react";
import { Portal } from "../Portal/Portal";
import { calculateFloatingPosition, rectToAnchor, useFloatingInteractions } from "../../hooks";
import {
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER,
  COLOR_INPUT_BORDER_FOCUS,
  COLOR_SURFACE_RAISED,
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_ICON,
  COLOR_FOCUS_RING,
  RADIUS_SM,
  SHADOW_MD,
  Z_DROPDOWN,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
} from "../../themes/styles";

function getOptionBackground(isSelected: boolean, isFocused: boolean): string {
  if (isSelected) {
    return COLOR_SELECTED;
  }
  if (isFocused) {
    return COLOR_HOVER;
  }
  return "transparent";
}

export type SelectOption<T extends string = string> = {
  value: T;
  label?: string;
  preview?: ReactNode;
  disabled?: boolean;
};

export type SelectProps<T extends string = string> = {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
};

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, fontSize: SIZE_FONT_SM, padding: SPACE_SM },
  md: { height: SIZE_HEIGHT_MD, fontSize: SIZE_FONT_SM, padding: SPACE_MD },
  lg: { height: SIZE_HEIGHT_LG, fontSize: SIZE_FONT_SM, padding: SPACE_LG },
};

// =============================================================================
// Option Sub-component
// =============================================================================

type SelectOptionItemProps<T extends string> = {
  option: SelectOption<T>;
  index: number;
  isSelected: boolean;
  isFocused: boolean;
  sizeConfig: typeof sizeMap.md;
  onOptionClick: (value: T, disabled?: boolean) => void;
  onOptionHover: (index: number) => void;
};

function areSelectOptionItemPropsEqual<T extends string>(
  prevProps: SelectOptionItemProps<T>,
  nextProps: SelectOptionItemProps<T>,
): boolean {
  // Compare option by actual content (skip preview which is ReactNode)
  if (prevProps.option.value !== nextProps.option.value) {
    return false;
  }
  if (prevProps.option.label !== nextProps.option.label) {
    return false;
  }
  if (prevProps.option.disabled !== nextProps.option.disabled) {
    return false;
  }

  // Compare other props
  if (prevProps.index !== nextProps.index) {
    return false;
  }
  if (prevProps.isSelected !== nextProps.isSelected) {
    return false;
  }
  if (prevProps.isFocused !== nextProps.isFocused) {
    return false;
  }
  if (prevProps.sizeConfig !== nextProps.sizeConfig) {
    return false;
  }

  // Skip callback comparison - they work correctly via closures
  return true;
}

const optionPreviewStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  alignItems: "center",
};

const SelectOptionItemInner = function SelectOptionItem<T extends string>({
  option,
  index,
  isSelected,
  isFocused,
  sizeConfig,
  onOptionClick,
  onOptionHover,
}: SelectOptionItemProps<T>) {
  const handleClick = useCallback(() => {
    onOptionClick(option.value, option.disabled);
  }, [onOptionClick, option.value, option.disabled]);

  const handlePointerEnter = useCallback(() => {
    onOptionHover(index);
  }, [onOptionHover, index]);

  const style = useMemo<CSSProperties>(() => ({
    display: "flex",
    alignItems: "center",
    padding: `${SPACE_SM} ${sizeConfig.padding}`,
    backgroundColor: getOptionBackground(isSelected, isFocused),
    color: option.disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: sizeConfig.fontSize,
    cursor: option.disabled ? "not-allowed" : "pointer",
    opacity: option.disabled ? 0.5 : 1,
    gap: SPACE_SM,
  }), [sizeConfig.padding, sizeConfig.fontSize, isSelected, isFocused, option.disabled]);

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={option.disabled}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      style={style}
    >
      {option.preview && (
        <div style={optionPreviewStyle}>
          {option.preview}
        </div>
      )}
      {option.label && <span>{option.label}</span>}
    </div>
  );
};

const SelectOptionItem = memo(SelectOptionItemInner, areSelectOptionItemPropsEqual) as <T extends string>(props: SelectOptionItemProps<T>) => React.ReactElement;



type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

// =============================================================================
// Dropdown Sub-component
// =============================================================================

type SelectDropdownHandle = {
  moveFocus: (direction: "up" | "down") => void;
  getFocusedIndex: () => number;
  setInitialFocus: (index: number) => void;
};

type SelectDropdownProps<T extends string> = {
  options: SelectOption<T>[];
  value: T;
  sizeConfig: typeof sizeMap.md;
  dropdownPosition: DropdownPosition;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onOptionClick: (value: T, disabled?: boolean) => void;
};

const SelectDropdownInner = <T extends string>(
  {
    options,
    value,
    sizeConfig,
    dropdownPosition,
    dropdownRef,
    onOptionClick,
  }: SelectDropdownProps<T>,
  ref: React.ForwardedRef<SelectDropdownHandle>,
) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  React.useImperativeHandle(ref, () => ({
    moveFocus: (direction: "up" | "down") => {
      setFocusedIndex((prev) => {
        if (direction === "down") {
          return Math.min(prev + 1, options.length - 1);
        }
        return Math.max(prev - 1, 0);
      });
    },
    getFocusedIndex: () => focusedIndex,
    setInitialFocus: (index: number) => {
      setFocusedIndex(index);
    },
  }), [focusedIndex, options.length]);

  const handleOptionHover = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const dropdownStyle = useMemo<CSSProperties>(() => ({
    position: "fixed",
    top: dropdownPosition.top,
    left: dropdownPosition.left,
    width: dropdownPosition.width,
    backgroundColor: COLOR_SURFACE_RAISED,
    border: `1px solid ${COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    boxShadow: SHADOW_MD,
    zIndex: Z_DROPDOWN,
    maxHeight: "240px",
    overflowY: "auto",
  }), [dropdownPosition.top, dropdownPosition.left, dropdownPosition.width]);

  return (
    <div ref={dropdownRef} role="listbox" style={dropdownStyle}>
      {options.map((option, index) => (
        <SelectOptionItem
          key={option.value}
          option={option}
          index={index}
          isSelected={option.value === value}
          isFocused={index === focusedIndex}
          sizeConfig={sizeConfig}
          onOptionClick={onOptionClick}
          onOptionHover={handleOptionHover}
        />
      ))}
    </div>
  );
};

const SelectDropdown = memo(React.forwardRef(SelectDropdownInner)) as <T extends string>(
  props: SelectDropdownProps<T> & { ref?: React.Ref<SelectDropdownHandle> },
) => React.ReactElement;

// =============================================================================
// Main Select component
// =============================================================================

const DROPDOWN_MAX_HEIGHT = 240;

export const Select = memo(function Select<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Select...",
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownHandleRef = useRef<SelectDropdownHandle>(null);
  const sizeConfig = sizeMap[size];

  const selectedOption = options.find((opt) => opt.value === value);

  const updateDropdownPosition = useEffectEvent(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const anchor = rectToAnchor(rect);
      const { x, y } = calculateFloatingPosition({
        anchor,
        floatingWidth: rect.width,
        floatingHeight: DROPDOWN_MAX_HEIGHT,
        placement: "bottom",
        offset: 4,
      });
      setDropdownPosition({ top: y, left: x, width: rect.width });
    }
  });

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useLayoutEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  useFloatingInteractions({
    isOpen,
    onClose: handleClose,
    anchorRef: containerRef,
    floatingRef: dropdownRef,
    onReposition: updateDropdownPosition,
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen) {
          const focusedIndex = dropdownHandleRef.current?.getFocusedIndex() ?? -1;
          if (focusedIndex >= 0) {
            const option = options[focusedIndex];
            if (option && !option.disabled) {
              onChange(option.value);
              setIsOpen(false);
            }
          }
        } else {
          setIsOpen(true);
          // Set initial focus after dropdown mounts
          requestAnimationFrame(() => {
            dropdownHandleRef.current?.setInitialFocus(options.findIndex((o) => o.value === value));
          });
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          requestAnimationFrame(() => {
            dropdownHandleRef.current?.setInitialFocus(options.findIndex((o) => o.value === value));
          });
        } else {
          dropdownHandleRef.current?.moveFocus("down");
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          dropdownHandleRef.current?.moveFocus("up");
        }
        break;
    }
  };

  const triggerStyle = useMemo<CSSProperties>(() => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: sizeConfig.height,
    padding: `0 ${sizeConfig.padding}`,
    backgroundColor: COLOR_INPUT_BG,
    border: `1px solid ${isOpen ? COLOR_INPUT_BORDER_FOCUS : COLOR_INPUT_BORDER}`,
    borderRadius: RADIUS_SM,
    color: selectedOption ? COLOR_TEXT : COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: `border-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
    boxShadow: isOpen ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
    gap: SPACE_SM,
  }), [sizeConfig.height, sizeConfig.padding, sizeConfig.fontSize, isOpen, selectedOption, disabled]);

  const previewContainerStyle = useMemo<CSSProperties>(() => ({
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: 0,
    overflow: "hidden",
  }), []);

  const handleTriggerClick = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  }, [disabled]);

  const handleOptionClick = useCallback((optionValue: T, optionDisabled?: boolean) => {
    if (!optionDisabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  }, [onChange]);

  const containerStyle = useMemo<CSSProperties>(() => ({
    position: "relative",
    width: "100%",
  }), []);

  const labelStyle = useMemo<CSSProperties>(() => ({
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }), []);

  const chevronStyle = useMemo<CSSProperties>(() => ({
    display: "flex",
    flexShrink: 0,
    color: COLOR_ICON,
    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
    transition: `transform ${DURATION_FAST} ${EASING_DEFAULT}`,
  }), [isOpen]);


  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
    >
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        style={triggerStyle}
      >
        {selectedOption?.preview && <div style={previewContainerStyle}>{selectedOption.preview}</div>}
        {!selectedOption?.preview && (
          <span style={labelStyle}>
            {selectedOption?.label ?? placeholder}
          </span>
        )}
        <span style={chevronStyle}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      {isOpen && (
        <Portal>
          <SelectDropdown
            ref={dropdownHandleRef}
            options={options}
            value={value}
            sizeConfig={sizeConfig}
            dropdownPosition={dropdownPosition}
            dropdownRef={dropdownRef}
            onOptionClick={handleOptionClick}
          />
        </Portal>
      )}
    </div>
  );
}) as <T extends string = string>(props: SelectProps<T>) => React.ReactElement;
