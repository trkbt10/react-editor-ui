/**
 * @file TabButton - Individual tab button with variant-specific styling
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_TEXT,
  COLOR_SURFACE,
  COLOR_SURFACE_OVERLAY,
  COLOR_TEXT_MUTED,
  COLOR_FOCUS_RING,
  COLOR_BORDER,
  COLOR_ICON,
  COLOR_SELECTED,
  SIZE_HEIGHT_MD,
  SPACE_SM,
  SPACE_MD,
  DURATION_FAST,
  EASING_DEFAULT,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_NORMAL,
  RADIUS_MD,
  RADIUS_LG,
  SHADOW_SM,
} from "../../themes/styles";
import { TabCloseButton } from "./TabCloseButton";
import type { TabBarTab, TabBarVariant, SizeConfig } from "./TabBar";

// ========================================
// STATIC STYLES
// ========================================

const iconWrapperStyle: CSSProperties = {
  marginRight: SPACE_SM,
  display: "flex",
};

// ========================================
// TYPES
// ========================================

export type TabButtonProps = {
  tab: TabBarTab;
  active: boolean;
  sizeConfig: SizeConfig;
  fullWidth: boolean;
  variant: TabBarVariant;
  onClick: (tabId: string) => void;
  onClose?: (tabId: string) => void;
};

// ========================================
// STYLE BUILDERS
// ========================================

type StyleState = {
  active: boolean;
  isHovered: boolean;
  isPressed: boolean;
  isFocused: boolean;
  isDisabled: boolean;
  fullWidth: boolean;
  sizeConfig: SizeConfig;
};

function getPillsBackgroundColor(state: StyleState): string {
  const { active, isDisabled, isPressed, isHovered } = state;
  if (active) {
    return COLOR_SURFACE;
  }
  if (isDisabled) {
    return "transparent";
  }
  if (isPressed) {
    return COLOR_ACTIVE;
  }
  if (isHovered) {
    return COLOR_HOVER;
  }
  return "transparent";
}

function getPillsBoxShadow(state: StyleState): string {
  const { isFocused, active } = state;
  if (isFocused) {
    return `0 0 0 2px ${COLOR_FOCUS_RING}`;
  }
  if (active) {
    return SHADOW_SM;
  }
  return "none";
}

function getFilesBackgroundColor(state: StyleState): string {
  const { active, isHovered } = state;
  if (active) {
    return COLOR_SURFACE_OVERLAY;
  }
  if (isHovered) {
    return COLOR_HOVER;
  }
  return "transparent";
}

function getIconsBackgroundColor(state: StyleState): string {
  const { active, isHovered } = state;
  if (active) {
    return COLOR_SELECTED;
  }
  if (isHovered) {
    return COLOR_HOVER;
  }
  return "transparent";
}

function getFocusShadow(isFocused: boolean): string {
  if (isFocused) {
    return `0 0 0 2px ${COLOR_FOCUS_RING}`;
  }
  return "none";
}

function buildPillsStyle(state: StyleState): CSSProperties {
  const { active, isDisabled, fullWidth, sizeConfig } = state;

  return {
    flex: fullWidth ? 1 : "0 0 auto",
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: sizeConfig.innerHeight,
    padding: `0 ${sizeConfig.paddingX}`,
    border: "none",
    borderRadius: RADIUS_LG,
    backgroundColor: getPillsBackgroundColor(state),
    boxShadow: getPillsBoxShadow(state),
    color: active ? COLOR_TEXT : COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    fontWeight: active ? FONT_WEIGHT_MEDIUM : FONT_WEIGHT_NORMAL,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
    whiteSpace: "nowrap",
  };
}

function buildFilesStyle(state: StyleState): CSSProperties {
  const { active, isFocused, isDisabled, sizeConfig } = state;
  const borderColor = active ? COLOR_BORDER : "transparent";

  return {
    display: "flex",
    alignItems: "center",
    height: sizeConfig.innerHeight,
    padding: `0 ${SPACE_MD}`,
    border: `1px solid ${borderColor}`,
    borderRadius: RADIUS_MD,
    backgroundColor: getFilesBackgroundColor(state),
    color: active ? COLOR_TEXT : COLOR_TEXT_MUTED,
    fontSize: sizeConfig.fontSize,
    fontWeight: FONT_WEIGHT_NORMAL,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
    whiteSpace: "nowrap",
    boxShadow: getFocusShadow(isFocused),
  };
}

function buildIconsStyle(state: StyleState): CSSProperties {
  const { active, isFocused, isDisabled } = state;

  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: SIZE_HEIGHT_MD,
    height: SIZE_HEIGHT_MD,
    border: "none",
    borderRadius: RADIUS_MD,
    backgroundColor: getIconsBackgroundColor(state),
    color: active ? COLOR_TEXT : COLOR_ICON,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
    outline: "none",
    boxShadow: getFocusShadow(isFocused),
  };
}

function buildButtonStyle(variant: TabBarVariant, state: StyleState): CSSProperties {
  if (variant === "pills") {
    return buildPillsStyle(state);
  }
  if (variant === "files") {
    return buildFilesStyle(state);
  }
  return buildIconsStyle(state);
}

// ========================================
// CONTENT RENDERERS
// ========================================

type ContentProps = {
  tab: TabBarTab;
  variant: TabBarVariant;
  onClose?: () => void;
};

const TabContent = memo(function TabContent({ tab, variant, onClose }: ContentProps) {
  if (variant === "icons") {
    return <>{tab.icon ?? tab.label.charAt(0)}</>;
  }

  if (variant === "files") {
    const showClose = tab.closable && onClose;
    return (
      <>
        {tab.icon ? <span style={iconWrapperStyle}>{tab.icon}</span> : null}
        <span>{tab.label}</span>
        {showClose ? <TabCloseButton onClose={onClose} isDirty={tab.isDirty} /> : null}
      </>
    );
  }

  // pills variant
  return <>{tab.label}</>;
});

// ========================================
// TAB BUTTON
// ========================================

function TabButtonInner({
  tab,
  active,
  sizeConfig,
  fullWidth,
  variant,
  onClick,
  onClose,
}: TabButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isDisabled = tab.disabled ?? false;

  const buttonStyle = useMemo<CSSProperties>(() => {
    const state: StyleState = {
      active,
      isHovered,
      isPressed,
      isFocused,
      isDisabled,
      fullWidth,
      sizeConfig,
    };
    return buildButtonStyle(variant, state);
  }, [active, isHovered, isPressed, isFocused, isDisabled, fullWidth, variant, sizeConfig]);

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onClick(tab.id);
    }
  }, [onClick, tab.id, isDisabled]);

  const handleClose = useCallback(() => {
    onClose?.(tab.id);
  }, [onClose, tab.id]);

  const pointerHandlers = useMemo(
    () => ({
      enter: () => {
        if (!isDisabled) {
          setIsHovered(true);
        }
      },
      leave: () => {
        setIsHovered(false);
        setIsPressed(false);
      },
      down: () => {
        if (!isDisabled && !active) {
          setIsPressed(true);
        }
      },
      up: () => {
        setIsPressed(false);
      },
    }),
    [isDisabled, active],
  );

  const focusHandlers = useMemo(
    () => ({
      focus: () => {
        setIsFocused(true);
      },
      blur: () => {
        setIsFocused(false);
      },
    }),
    [],
  );

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={isDisabled}
      aria-label={variant === "icons" ? tab.label : undefined}
      disabled={isDisabled}
      onClick={handleClick}
      onPointerEnter={pointerHandlers.enter}
      onPointerLeave={pointerHandlers.leave}
      onPointerDown={pointerHandlers.down}
      onPointerUp={pointerHandlers.up}
      onFocus={focusHandlers.focus}
      onBlur={focusHandlers.blur}
      style={buttonStyle}
    >
      <TabContent tab={tab} variant={variant} onClose={handleClose} />
    </button>
  );
}

// ========================================
// MEMO COMPARISON
// ========================================

function areTabButtonPropsEqual(prev: TabButtonProps, next: TabButtonProps): boolean {
  // Compare tab by actual content (skip icon which is ReactNode)
  if (prev.tab.id !== next.tab.id) {
    return false;
  }
  if (prev.tab.label !== next.tab.label) {
    return false;
  }
  if (prev.tab.disabled !== next.tab.disabled) {
    return false;
  }
  if (prev.tab.closable !== next.tab.closable) {
    return false;
  }
  if (prev.tab.isDirty !== next.tab.isDirty) {
    return false;
  }

  // Compare other props
  if (prev.active !== next.active) {
    return false;
  }
  if (prev.sizeConfig !== next.sizeConfig) {
    return false;
  }
  if (prev.fullWidth !== next.fullWidth) {
    return false;
  }
  if (prev.variant !== next.variant) {
    return false;
  }

  return true;
}

export const TabButton = memo(TabButtonInner, areTabButtonPropsEqual);
