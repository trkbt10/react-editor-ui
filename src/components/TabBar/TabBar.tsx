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

import { memo, useMemo } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  COLOR_SURFACE_RAISED,
  SIZE_FONT_SM,
  SIZE_FONT_MD,
  SIZE_HEIGHT_MD,
  SIZE_HEIGHT_LG,
  SIZE_HEIGHT_XL,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  RADIUS_LG,
} from "../../themes/styles";
import { TabButton } from "./TabButton";

// ========================================
// TYPES
// ========================================

export type TabBarTab = {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  isDirty?: boolean;
};

export type TabBarVariant = "pills" | "files" | "icons";

export type SizeConfig = {
  height: string;
  innerHeight: string;
  fontSize: string;
  paddingX: string;
  containerPadding: string;
  gap: string;
};

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

// ========================================
// SIZE CONFIG
// ========================================

const sizeMap: Record<"sm" | "md" | "lg", SizeConfig> = {
  sm: {
    height: SIZE_HEIGHT_MD,
    innerHeight: `calc(${SIZE_HEIGHT_MD} - ${SPACE_SM} * 2)`,
    fontSize: SIZE_FONT_SM,
    paddingX: SPACE_MD,
    containerPadding: SPACE_SM,
    gap: SPACE_XS,
  },
  md: {
    height: SIZE_HEIGHT_LG,
    innerHeight: `calc(${SIZE_HEIGHT_LG} - ${SPACE_SM} * 2)`,
    fontSize: SIZE_FONT_SM,
    paddingX: SPACE_MD,
    containerPadding: SPACE_SM,
    gap: SPACE_SM,
  },
  lg: {
    height: SIZE_HEIGHT_XL,
    innerHeight: `calc(${SIZE_HEIGHT_XL} - ${SPACE_MD} * 2)`,
    fontSize: SIZE_FONT_MD,
    paddingX: SPACE_MD,
    containerPadding: SPACE_MD,
    gap: SPACE_SM,
  },
};

// ========================================
// CONTAINER STYLE BUILDERS
// ========================================

function buildPillsContainerStyle(sizeConfig: SizeConfig, fullWidth: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    width: fullWidth ? "100%" : "auto",
    height: sizeConfig.height,
    padding: sizeConfig.containerPadding,
    backgroundColor: COLOR_SURFACE_RAISED,
    borderRadius: `calc(${RADIUS_LG} + ${sizeConfig.containerPadding})`,
    gap: sizeConfig.gap,
    boxSizing: "border-box",
  };
}

function buildFilesContainerStyle(sizeConfig: SizeConfig, fullWidth: boolean): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    width: fullWidth ? "100%" : "auto",
    height: sizeConfig.height,
    gap: SPACE_XS,
    boxSizing: "border-box",
  };
}

function buildIconsContainerStyle(): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACE_XS,
    padding: SPACE_SM,
    boxSizing: "border-box",
  };
}

// ========================================
// COMPONENT
// ========================================

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
    if (variant === "pills") {
      return buildPillsContainerStyle(sizeConfig, fullWidth);
    }
    if (variant === "files") {
      return buildFilesContainerStyle(sizeConfig, fullWidth);
    }
    return buildIconsContainerStyle();
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
