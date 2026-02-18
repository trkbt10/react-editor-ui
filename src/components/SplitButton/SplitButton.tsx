/**
 * @file SplitButton component - A button with dropdown menu for multiple actions
 *
 * @description
 * A two-part button: the main button executes the current action, while the
 * dropdown arrow reveals additional options. Supports categories with headers,
 * keyboard shortcuts, and icons. Ideal for tool selectors with multiple variants.
 *
 * @example
 * ```tsx
 * import { SplitButton } from "react-editor-ui/SplitButton";
 *
 * const [tool, setTool] = useState("pen");
 *
 * <SplitButton
 *   value={tool}
 *   onChange={setTool}
 *   onAction={() => console.log("Activate", tool)}
 *   options={[
 *     { value: "pen", label: "Pen", icon: <PenIcon /> },
 *     { value: "brush", label: "Brush", icon: <BrushIcon /> },
 *   ]}
 * />
 * ```
 */

import {
  useState,
  useRef,
  useEffectEvent,
  useLayoutEffect,
  useCallback,
  useMemo,
  memo,
  type ReactNode,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { Portal } from "../Portal/Portal";
import { calculateFloatingPosition, rectToAnchor, useFloatingInteractions } from "../../hooks";
import {
  COLOR_SURFACE_RAISED,
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_BORDER,
  COLOR_FOCUS_RING,
  COLOR_PRIMARY,
  RADIUS_SM,
  SHADOW_MD,
  Z_DROPDOWN,
  DURATION_FAST,
  EASING_DEFAULT,
  SIZE_FONT_SM,
  SIZE_ICON_SM,
  SIZE_ICON_MD,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
} from "../../themes/styles";
import { CheckIcon, ChevronDownIcon } from "../../icons";

export type SplitButtonOption<T extends string = string> = {
  /** Unique value identifier */
  value: T;
  /** Display label */
  label: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Disabled state */
  disabled?: boolean;
};

export type SplitButtonCategory<T extends string = string> = {
  /** Unique category identifier */
  id: string;
  /** Category label displayed as header */
  label: string;
  /** Options within this category */
  options: SplitButtonOption<T>[];
};

type SplitButtonBaseProps<T extends string = string> = {
  /** Currently selected value */
  value: T;
  /** Called when an option is selected */
  onChange: (value: T) => void;
  /** Called when the main button is clicked */
  onAction?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Visual variant (selected shows active state) */
  variant?: "default" | "selected";
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label */
  "aria-label"?: string;
  /** Additional class name */
  className?: string;
};

export type SplitButtonProps<T extends string = string> = SplitButtonBaseProps<T> & (
  | {
      /** Available options (flat list) */
      options: SplitButtonOption<T>[];
      categories?: never;
    }
  | {
      options?: never;
      /** Categorized options with headers */
      categories: SplitButtonCategory<T>[];
    }
);

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, iconSize: SIZE_ICON_SM, padding: SPACE_SM },
  md: { height: SIZE_HEIGHT_MD, iconSize: SIZE_ICON_MD, padding: SPACE_MD },
  lg: { height: SIZE_HEIGHT_LG, iconSize: SIZE_ICON_MD, padding: SPACE_LG },
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const checkIconWrapperStyle: CSSProperties = {
  width: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: COLOR_TEXT,
};

const optionIconWrapperStyle: CSSProperties = {
  width: "16px",
  height: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: COLOR_ICON,
};

const optionLabelStyle: CSSProperties = {
  flex: 1,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const optionShortcutStyle: CSSProperties = {
  marginLeft: SPACE_LG,
  color: COLOR_TEXT_MUTED,
  fontSize: SIZE_FONT_SM,
  flexShrink: 0,
};

const categoryHeaderStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: COLOR_TEXT_MUTED,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  padding: `${SPACE_MD} ${SPACE_MD} ${SPACE_SM}`,
};

type SplitButtonOptionItemProps<T extends string> = {
  option: SplitButtonOption<T>;
  isSelected: boolean;
  isFocused: boolean;
  index: number;
  onOptionClick: (option: SplitButtonOption<T>) => void;
  onPointerEnter: (index: number) => void;
};

const SplitButtonOptionItem = memo(function SplitButtonOptionItem<T extends string>({
  option,
  isSelected,
  isFocused,
  index,
  onOptionClick,
  onPointerEnter,
}: SplitButtonOptionItemProps<T>) {
  const isDisabled = option.disabled ?? false;

  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_MD,
      padding: `${SPACE_SM} ${SPACE_MD}`,
      backgroundColor: isFocused ? COLOR_HOVER : "transparent",
      color: isDisabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
      fontSize: SIZE_FONT_SM,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      borderRadius: RADIUS_SM,
      border: "none",
      width: "100%",
      textAlign: "left",
    }),
    [isFocused, isDisabled],
  );

  const handleClick = useCallback(() => {
    onOptionClick(option);
  }, [onOptionClick, option]);

  const handlePointerEnter = useCallback(() => {
    onPointerEnter(index);
  }, [onPointerEnter, index]);

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      style={style}
    >
      <span style={checkIconWrapperStyle}>
        {isSelected && <CheckIcon />}
      </span>
      <span style={optionIconWrapperStyle}>
        {option.icon}
      </span>
      <span style={optionLabelStyle}>
        {option.label}
      </span>
      {option.shortcut && (
        <span style={optionShortcutStyle}>
          {option.shortcut}
        </span>
      )}
    </button>
  );
}) as <T extends string>(props: SplitButtonOptionItemProps<T>) => React.ReactElement;

// =============================================================================
// SplitButtonDropdownContent
// =============================================================================

type SplitButtonDropdownContentProps<T extends string> = {
  categories: SplitButtonCategory<T>[] | undefined;
  flatOptions: SplitButtonOption<T>[];
  value: T;
  focusedIndex: number;
  categoryHeaderStyle: CSSProperties;
  onOptionClick: (option: SplitButtonOption<T>) => void;
  onPointerEnter: (index: number) => void;
};

function SplitButtonDropdownContent<T extends string>({
  categories,
  flatOptions,
  value,
  focusedIndex,
  categoryHeaderStyle,
  onOptionClick,
  onPointerEnter,
}: SplitButtonDropdownContentProps<T>) {
  if (categories) {
    // Calculate global indices for each category start
    const categoryStartIndices = categories.reduce<number[]>(
      (acc, category, i) => {
        if (i === 0) {
          return [0];
        }
        return [...acc, acc[i - 1] + categories[i - 1].options.length];
      },
      [],
    );

    return (
      <>
        {categories.map((category, catIndex) => (
          <div key={category.id}>
            <div style={categoryHeaderStyle}>{category.label}</div>
            {category.options.map((option, optIndex) => {
              const globalIndex = categoryStartIndices[catIndex] + optIndex;
              return (
                <SplitButtonOptionItem
                  key={option.value}
                  option={option}
                  isSelected={option.value === value}
                  isFocused={globalIndex === focusedIndex}
                  index={globalIndex}
                  onOptionClick={onOptionClick}
                  onPointerEnter={onPointerEnter}
                />
              );
            })}
          </div>
        ))}
      </>
    );
  }

  // Render flat options
  return (
    <>
      {flatOptions.map((option, index) => (
        <SplitButtonOptionItem
          key={option.value}
          option={option}
          isSelected={option.value === value}
          isFocused={index === focusedIndex}
          index={index}
          onOptionClick={onOptionClick}
          onPointerEnter={onPointerEnter}
        />
      ))}
    </>
  );
}

/**
 * SplitButton displays a main action button with a dropdown for additional options.
 * The main button executes the selected action, while the dropdown allows changing the selection.
 */
function SplitButtonInner<T extends string = string>({
  options,
  categories,
  value,
  onChange,
  onAction,
  size = "md",
  variant = "default",
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: SplitButtonProps<T>) {
  const isSelected = variant === "selected";
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 300,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sizeConfig = sizeMap[size];

  // Flatten categories into a single options array for keyboard navigation
  const flatOptions = useMemo(() => {
    if (options) {
      return options;
    }
    if (categories) {
      return categories.flatMap((cat) => cat.options);
    }
    return [];
  }, [options, categories]);

  const selectedOption = flatOptions.find((opt) => opt.value === value);

  const updateDropdownPosition = useEffectEvent(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const minWidth = 180;
      const dropdownWidth = Math.max(rect.width, minWidth);
      const anchor = rectToAnchor(rect);
      const viewportPadding = 8;
      const maxAllowedHeight = 300;
      const { x, y } = calculateFloatingPosition({
        anchor,
        floatingWidth: dropdownWidth,
        floatingHeight: maxAllowedHeight,
        placement: "bottom",
        offset: 4,
        includeScrollOffset: false, // Using position: fixed
      });
      // Calculate maxHeight to fit within viewport
      const availableHeight = window.innerHeight - y - viewportPadding;
      const maxHeight = Math.min(maxAllowedHeight, availableHeight);
      setDropdownPosition({
        top: y,
        left: x,
        width: dropdownWidth,
        maxHeight,
      });
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) {
        return;
      }

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && focusedIndex >= 0) {
            const option = flatOptions[focusedIndex];
            if (option && !option.disabled) {
              onChange(option.value);
              setIsOpen(false);
            }
          } else {
            setIsOpen(true);
            setFocusedIndex(flatOptions.findIndex((o) => o.value === value));
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setFocusedIndex(flatOptions.findIndex((o) => o.value === value));
          } else {
            setFocusedIndex((prev) => Math.min(prev + 1, flatOptions.length - 1));
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setFocusedIndex((prev) => Math.max(prev - 1, 0));
          }
          break;
      }
    },
    [disabled, isOpen, focusedIndex, flatOptions, onChange, value],
  );

  const handleMainButtonClick = useCallback(() => {
    if (disabled) {
      return;
    }
    if (onAction) {
      onAction();
    }
  }, [disabled, onAction]);

  const handleDropdownToggle = useCallback(() => {
    if (disabled) {
      return;
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(flatOptions.findIndex((o) => o.value === value));
    }
  }, [disabled, isOpen, flatOptions, value]);

  const handleOptionClick = useCallback(
    (option: SplitButtonOption<T>) => {
      if (option.disabled) {
        return;
      }
      onChange(option.value);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleOptionPointerEnter = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "stretch",
      height: sizeConfig.height,
      borderRadius: RADIUS_SM,
      overflow: "hidden",
    }),
    [sizeConfig.height],
  );

  const mainButtonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `0 ${sizeConfig.padding}`,
      border: `1px solid ${isSelected ? COLOR_PRIMARY : COLOR_BORDER}`,
      borderRight: "none",
      borderRadius: `${RADIUS_SM} 0 0 ${RADIUS_SM}`,
      backgroundColor: isSelected ? COLOR_HOVER : "transparent",
      color: isSelected ? COLOR_PRIMARY : COLOR_ICON,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}, color ${DURATION_FAST} ${EASING_DEFAULT}`,
      outline: "none",
    }),
    [sizeConfig.padding, disabled, isSelected],
  );

  const dropdownButtonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 0,
      border: `1px solid ${COLOR_BORDER}`,
      borderRadius: `0 ${RADIUS_SM} ${RADIUS_SM} 0`,
      backgroundColor: "transparent",
      color: COLOR_ICON,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      outline: "none",
    }),
    [disabled],
  );

  const iconStyle = useMemo<CSSProperties>(
    () => ({
      width: sizeConfig.iconSize,
      height: sizeConfig.iconSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    [sizeConfig.iconSize],
  );

  const dropdownStyle = useMemo<CSSProperties>(
    () => ({
      position: "fixed",
      top: dropdownPosition.top,
      left: dropdownPosition.left,
      minWidth: dropdownPosition.width,
      maxHeight: dropdownPosition.maxHeight,
      overflowY: "auto",
      backgroundColor: COLOR_SURFACE_RAISED,
      border: `1px solid ${COLOR_BORDER}`,
      borderRadius: RADIUS_SM,
      boxShadow: SHADOW_MD,
      zIndex: Z_DROPDOWN,
      padding: SPACE_SM,
    }),
    [dropdownPosition.top, dropdownPosition.left, dropdownPosition.width, dropdownPosition.maxHeight],
  );

  const handleMainPointerEnter = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
      e.currentTarget.style.color = COLOR_ICON_HOVER;
    },
    [disabled],
  );

  const handleMainPointerLeave = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = COLOR_ICON;
    },
    [disabled],
  );

  const handleMainPointerDown = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }
      e.currentTarget.style.backgroundColor = COLOR_ACTIVE;
    },
    [disabled],
  );

  const handleMainPointerUp = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    },
    [disabled],
  );

  const handleDropdownPointerEnter = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled || isOpen) {
        return;
      }
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    },
    [disabled, isOpen],
  );

  const handleDropdownPointerLeave = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (disabled || isOpen) {
        return;
      }
      e.currentTarget.style.backgroundColor = "transparent";
    },
    [disabled, isOpen],
  );

  const handleFocus = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = `0 0 0 2px ${COLOR_FOCUS_RING}`;
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "none";
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
    >
      <button
        type="button"
        aria-label={ariaLabel ?? selectedOption?.label}
        disabled={disabled}
        onClick={handleMainButtonClick}
        onPointerEnter={handleMainPointerEnter}
        onPointerLeave={handleMainPointerLeave}
        onPointerDown={handleMainPointerDown}
        onPointerUp={handleMainPointerUp}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={mainButtonStyle}
      >
        <span style={iconStyle}>
          {selectedOption?.icon}
        </span>
      </button>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
        onClick={handleDropdownToggle}
        onKeyDown={handleKeyDown}
        onPointerEnter={handleDropdownPointerEnter}
        onPointerLeave={handleDropdownPointerLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={dropdownButtonStyle}
      >
        <ChevronDownIcon />
      </button>
      {isOpen && (
        <Portal>
          <div ref={dropdownRef} role="listbox" style={dropdownStyle}>
            <SplitButtonDropdownContent
              categories={categories}
              flatOptions={flatOptions}
              value={value}
              focusedIndex={focusedIndex}
              categoryHeaderStyle={categoryHeaderStyle}
              onOptionClick={handleOptionClick}
              onPointerEnter={handleOptionPointerEnter}
            />
          </div>
        </Portal>
      )}
    </div>
  );
}

// Memo wrapper with generic type support
export const SplitButton = memo(SplitButtonInner) as typeof SplitButtonInner;
