/**
 * @file SplitButton component - A button with dropdown menu for multiple actions
 */

import {
  useState,
  useRef,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  type ReactNode,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { Portal } from "../Portal/Portal";
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
} from "../../constants/styles";
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

export type SplitButtonProps<T extends string = string> = {
  /** Available options */
  options: SplitButtonOption<T>[];
  /** Currently selected value */
  value: T;
  /** Called when an option is selected */
  onChange: (value: T) => void;
  /** Called when the main button is clicked */
  onAction?: () => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Disabled state */
  disabled?: boolean;
  /** Accessibility label */
  "aria-label"?: string;
  /** Additional class name */
  className?: string;
};

const sizeMap = {
  sm: { height: SIZE_HEIGHT_SM, iconSize: SIZE_ICON_SM, padding: SPACE_SM },
  md: { height: SIZE_HEIGHT_MD, iconSize: SIZE_ICON_MD, padding: SPACE_MD },
  lg: { height: SIZE_HEIGHT_LG, iconSize: SIZE_ICON_MD, padding: SPACE_LG },
};

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

/**
 * SplitButton displays a main action button with a dropdown for additional options.
 * The main button executes the selected action, while the dropdown allows changing the selection.
 */
export function SplitButton<T extends string = string>({
  options,
  value,
  onChange,
  onAction,
  size = "md",
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: SplitButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sizeConfig = sizeMap[size];

  const selectedOption = options.find((opt) => opt.value === value);

  const updateDropdownPosition = useEffectEvent(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 180),
      });
    }
  });

  const handleClickOutside = useEffectEvent((event: globalThis.PointerEvent) => {
    const target = event.target as Node;
    if (
      containerRef.current &&
      !containerRef.current.contains(target) &&
      dropdownRef.current &&
      !dropdownRef.current.contains(target)
    ) {
      setIsOpen(false);
    }
  });

  useLayoutEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("pointerdown", handleClickOutside);
      window.addEventListener("scroll", updateDropdownPosition, true);
      window.addEventListener("resize", updateDropdownPosition);
      return () => {
        document.removeEventListener("pointerdown", handleClickOutside);
        window.removeEventListener("scroll", updateDropdownPosition, true);
        window.removeEventListener("resize", updateDropdownPosition);
      };
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) {
      return;
    }

    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = options[focusedIndex];
          if (option && !option.disabled) {
            onChange(option.value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
          setFocusedIndex(options.findIndex((o) => o.value === value));
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(options.findIndex((o) => o.value === value));
        } else {
          setFocusedIndex((prev) => Math.min(prev + 1, options.length - 1));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
        }
        break;
    }
  };

  const handleMainButtonClick = () => {
    if (disabled) {
      return;
    }
    if (onAction) {
      onAction();
    }
  };

  const handleDropdownToggle = () => {
    if (disabled) {
      return;
    }
    setIsOpen(!isOpen);
    if (!isOpen) {
      setFocusedIndex(options.findIndex((o) => o.value === value));
    }
  };

  const handleOptionClick = (option: SplitButtonOption<T>) => {
    if (option.disabled) {
      return;
    }
    onChange(option.value);
    setIsOpen(false);
  };

  const containerStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "stretch",
    height: sizeConfig.height,
    borderRadius: RADIUS_SM,
    overflow: "hidden",
  };

  const mainButtonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `0 ${sizeConfig.padding}`,
    border: `1px solid ${COLOR_BORDER}`,
    borderRight: "none",
    borderRadius: `${RADIUS_SM} 0 0 ${RADIUS_SM}`,
    backgroundColor: "transparent",
    color: COLOR_ICON,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}, color ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
  };

  const dropdownButtonStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `0 ${SPACE_SM}`,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: `0 ${RADIUS_SM} ${RADIUS_SM} 0`,
    backgroundColor: isOpen ? COLOR_ACTIVE : "transparent",
    color: COLOR_ICON,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
  };

  const iconStyle: CSSProperties = {
    width: sizeConfig.iconSize,
    height: sizeConfig.iconSize,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const dropdownStyle: CSSProperties = {
    position: "absolute",
    top: dropdownPosition.top,
    left: dropdownPosition.left,
    minWidth: dropdownPosition.width,
    backgroundColor: COLOR_SURFACE_RAISED,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_SM,
    boxShadow: SHADOW_MD,
    zIndex: Z_DROPDOWN,
    padding: SPACE_SM,
  };

  const getOptionBackground = (isSelected: boolean, isFocused: boolean) => {
    if (isFocused) {
      return COLOR_HOVER;
    }
    return "transparent";
  };

  const getOptionStyle = (
    isSelected: boolean,
    isFocused: boolean,
    isDisabled: boolean
  ): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: SPACE_MD,
    padding: `${SPACE_SM} ${SPACE_MD}`,
    backgroundColor: getOptionBackground(isSelected, isFocused),
    color: isDisabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    borderRadius: RADIUS_SM,
    border: "none",
    width: "100%",
    textAlign: "left",
  });

  const handleMainPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_HOVER;
    e.currentTarget.style.color = COLOR_ICON_HOVER;
  };

  const handleMainPointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = COLOR_ICON;
  };

  const handleMainPointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_ACTIVE;
  };

  const handleMainPointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_HOVER;
  };

  const handleDropdownPointerEnter = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled || isOpen) {
      return;
    }
    e.currentTarget.style.backgroundColor = COLOR_HOVER;
  };

  const handleDropdownPointerLeave = (e: PointerEvent<HTMLButtonElement>) => {
    if (disabled || isOpen) {
      return;
    }
    e.currentTarget.style.backgroundColor = "transparent";
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = `0 0 0 2px ${COLOR_FOCUS_RING}`;
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    e.currentTarget.style.boxShadow = "none";
  };

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
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isFocused = index === focusedIndex;
              const isDisabled = option.disabled ?? false;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                  onClick={() => handleOptionClick(option)}
                  onPointerEnter={() => setFocusedIndex(index)}
                  style={getOptionStyle(isSelected, isFocused, isDisabled)}
                >
                  <span
                    style={{
                      width: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: COLOR_TEXT,
                    }}
                  >
                    {isSelected && <CheckIcon />}
                  </span>
                  <span
                    style={{
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      color: COLOR_ICON,
                    }}
                  >
                    {option.icon}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {option.label}
                  </span>
                  {option.shortcut && (
                    <span
                      style={{
                        marginLeft: SPACE_LG,
                        color: COLOR_TEXT_MUTED,
                        fontSize: SIZE_FONT_SM,
                        flexShrink: 0,
                      }}
                    >
                      {option.shortcut}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Portal>
      )}
    </div>
  );
}
