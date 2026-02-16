/**
 * @file TabBar component - Versatile tab bar with multiple variants
 *
 * @description
 * A compact tab bar for switching between views or sections.
 * Supports multiple variants: pills (default), files (with close button), and icons (icon-only).
 *
 * @example
 * ```tsx
 * import { TabBar } from "react-editor-ui/TabBar";
 *
 * // Pills variant (default)
 * <TabBar
 *   tabs={[
 *     { id: "design", label: "Design" },
 *     { id: "prototype", label: "Prototype" },
 *   ]}
 *   activeTab="design"
 *   onChange={(tabId) => setActiveTab(tabId)}
 * />
 *
 * // Files variant with close buttons
 * <TabBar
 *   variant="files"
 *   tabs={[
 *     { id: "file1", label: "index.tsx", closable: true },
 *     { id: "file2", label: "styles.css", closable: true, isDirty: true },
 *   ]}
 *   activeTab="file1"
 *   onChange={(tabId) => setActiveTab(tabId)}
 *   onClose={(tabId) => closeTab(tabId)}
 * />
 *
 * // Icons variant
 * <TabBar
 *   variant="icons"
 *   tabs={[
 *     { id: "folder", label: "Files", icon: <LuFolder /> },
 *     { id: "search", label: "Search", icon: <LuSearch /> },
 *   ]}
 *   activeTab="folder"
 *   onChange={(tabId) => setActiveTab(tabId)}
 * />
 * ```
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  COLOR_HOVER,
  COLOR_ACTIVE,
  COLOR_TEXT,
  COLOR_SURFACE,
  COLOR_SURFACE_RAISED,
  COLOR_SURFACE_OVERLAY,
  COLOR_TEXT_MUTED,
  COLOR_FOCUS_RING,
  COLOR_BORDER,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_SELECTED,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SIZE_HEIGHT_XL,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  DURATION_FAST,
  EASING_DEFAULT,
  FONT_WEIGHT_MEDIUM,
  FONT_WEIGHT_NORMAL,
  RADIUS_SM,
  RADIUS_MD,
  RADIUS_LG,
  SHADOW_SM,
} from "../../constants/styles";

export type TabBarTab = {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  isDirty?: boolean;
};

export type TabBarVariant = "pills" | "files" | "icons";

export type TabBarProps = {
  tabs: TabBarTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  onClose?: (tabId: string) => void;
  variant?: TabBarVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
};

type SizeConfig = {
  height: string;
  innerHeight: string;
  fontSize: string;
  paddingX: string;
  containerPadding: string;
  gap: string;
  iconSize: number;
};

type TabButtonProps = {
  tab: TabBarTab;
  active: boolean;
  sizeConfig: SizeConfig;
  fullWidth: boolean;
  variant: TabBarVariant;
  onClick: (tabId: string) => void;
  onClose?: (tabId: string) => void;
};

const sizeMap = {
  sm: {
    height: SIZE_HEIGHT_MD,
    innerHeight: `calc(${SIZE_HEIGHT_SM} - 2px)`,
    fontSize: SIZE_FONT_SM,
    paddingX: SPACE_MD,
    containerPadding: SPACE_XS,
    gap: SPACE_XS,
    iconSize: 14,
  },
  md: {
    height: SIZE_HEIGHT_LG,
    innerHeight: `calc(${SIZE_HEIGHT_MD} - 2px)`,
    fontSize: SIZE_FONT_SM,
    paddingX: SPACE_MD,
    containerPadding: SPACE_XS,
    gap: SPACE_SM,
    iconSize: 16,
  },
  lg: {
    height: SIZE_HEIGHT_XL,
    innerHeight: `calc(${SIZE_HEIGHT_LG} - 2px)`,
    fontSize: SIZE_FONT_MD,
    paddingX: SPACE_MD,
    containerPadding: SPACE_SM,
    gap: SPACE_SM,
    iconSize: 18,
  },
};

// Close button for file tabs (uses span to avoid nested button)
const CloseButton = memo(function CloseButton({
  onClose,
  isDirty,
}: {
  onClose: () => void;
  isDirty?: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      marginLeft: SPACE_SM,
      borderRadius: RADIUS_SM,
      backgroundColor: isHovered ? COLOR_HOVER : "transparent",
      color: isHovered ? COLOR_ICON_HOVER : COLOR_ICON,
      cursor: "pointer",
      transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [isHovered],
  );

  const dirtyDotStyle = useMemo<CSSProperties>(
    () => ({
      width: 8,
      height: 8,
      marginLeft: SPACE_SM,
      borderRadius: "50%",
      backgroundColor: COLOR_TEXT_MUTED,
      cursor: "pointer",
    }),
    [],
  );

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  }, [onClose]);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  if (isDirty && !isHovered) {
    return (
      <span
        role="button"
        tabIndex={0}
        style={dirtyDotStyle}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label="Close tab"
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      style={style}
      aria-label="Close tab"
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  );
});

const TabButton = memo(function TabButton({
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

  const iconWrapperStyle = useMemo<CSSProperties>(
    () => ({ marginRight: SPACE_SM, display: "flex" }),
    [],
  );

  const buttonStyle = useMemo<CSSProperties>(() => {
    // Pills variant (default)
    if (variant === "pills") {
      const getBackgroundColor = (): string => {
        if (active) { return COLOR_SURFACE; }
        if (isDisabled) { return "transparent"; }
        if (isPressed) { return COLOR_ACTIVE; }
        if (isHovered) { return COLOR_HOVER; }
        return "transparent";
      };

      const getBoxShadow = (): string => {
        if (isFocused) { return `0 0 0 2px ${COLOR_FOCUS_RING}`; }
        if (active) { return SHADOW_SM; }
        return "none";
      };

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
        backgroundColor: getBackgroundColor(),
        boxShadow: getBoxShadow(),
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

    // Files variant
    if (variant === "files") {
      return {
        display: "flex",
        alignItems: "center",
        height: sizeConfig.innerHeight,
        padding: `0 ${SPACE_MD}`,
        border: `1px solid ${active ? COLOR_BORDER : "transparent"}`,
        borderRadius: RADIUS_MD,
        backgroundColor: active ? COLOR_SURFACE_OVERLAY : isHovered ? COLOR_HOVER : "transparent",
        color: active ? COLOR_TEXT : COLOR_TEXT_MUTED,
        fontSize: sizeConfig.fontSize,
        fontWeight: FONT_WEIGHT_NORMAL,
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.5 : 1,
        transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
        outline: "none",
        whiteSpace: "nowrap",
        boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
      };
    }

    // Icons variant
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 28,
      height: 28,
      border: "none",
      borderRadius: RADIUS_MD,
      backgroundColor: active ? COLOR_SELECTED : isHovered ? COLOR_HOVER : "transparent",
      color: active ? COLOR_TEXT : COLOR_ICON,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
      outline: "none",
      boxShadow: isFocused ? `0 0 0 2px ${COLOR_FOCUS_RING}` : "none",
    };
  }, [active, isHovered, isPressed, isFocused, isDisabled, fullWidth, variant, sizeConfig]);

  const handleClick = useCallback(() => {
    if (!isDisabled) {
      onClick(tab.id);
    }
  }, [onClick, tab.id, isDisabled]);

  const handleClose = useCallback(
    () => {
      onClose?.(tab.id);
    },
    [onClose, tab.id],
  );

  const handlePointerEnter = useCallback(() => {
    if (!isDisabled) {
      setIsHovered(true);
    }
  }, [isDisabled]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);

  const handlePointerDown = useCallback(() => {
    if (!isDisabled && !active) {
      setIsPressed(true);
    }
  }, [isDisabled, active]);

  const handlePointerUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Render content based on variant
  const renderContent = () => {
    if (variant === "icons") {
      return tab.icon ?? tab.label.charAt(0);
    }
    if (variant === "files") {
      return (
        <>
          {tab.icon ? <span style={iconWrapperStyle}>{tab.icon}</span> : null}
          <span>{tab.label}</span>
          {tab.closable ? <CloseButton onClose={handleClose} isDirty={tab.isDirty} /> : null}
        </>
      );
    }
    return tab.label;
  };

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={isDisabled}
      aria-label={variant === "icons" ? tab.label : undefined}
      disabled={isDisabled}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onFocus={handleFocus}
      onBlur={handleBlur}
      style={buttonStyle}
    >
      {renderContent()}
    </button>
  );
});

export const TabBar = memo(function TabBar({
  tabs,
  activeTab,
  onChange,
  onClose,
  variant = "pills",
  size = "md",
  fullWidth = false,
  className,
}: TabBarProps) {
  const sizeConfig = sizeMap[size];

  const containerStyle = useMemo<CSSProperties>(() => {
    // Pills variant (default) - segmented control style
    if (variant === "pills") {
      return {
        display: "inline-flex",
        alignItems: "center",
        width: fullWidth ? "100%" : "auto",
        height: sizeConfig.height,
        padding: sizeConfig.containerPadding,
        backgroundColor: COLOR_SURFACE_RAISED,
        borderRadius: `calc(${RADIUS_LG} + 2px)`,
        gap: sizeConfig.gap,
        boxSizing: "border-box",
      };
    }

    // Files variant - browser-like tabs
    if (variant === "files") {
      return {
        display: "flex",
        alignItems: "center",
        width: fullWidth ? "100%" : "auto",
        height: sizeConfig.height,
        gap: SPACE_XS,
        boxSizing: "border-box",
      };
    }

    // Icons variant - icon-only tabs
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACE_XS,
      padding: SPACE_SM,
      boxSizing: "border-box",
    };
  }, [fullWidth, variant, sizeConfig]);

  return (
    <div role="tablist" className={className} style={containerStyle}>
      {tabs.map((tab) => (
        <TabButton
          key={tab.id}
          tab={tab}
          active={activeTab === tab.id}
          sizeConfig={sizeConfig}
          fullWidth={fullWidth && variant === "pills"}
          variant={variant}
          onClick={onChange}
          onClose={onClose}
        />
      ))}
    </div>
  );
});
