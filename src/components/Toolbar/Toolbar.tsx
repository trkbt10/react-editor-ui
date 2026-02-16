/**
 * @file Toolbar component - Container for toolbar items
 */

import { createContext, memo, useContext, useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  SIZE_TOOLBAR_HEIGHT,
  SPACE_SM,
  SPACE_MD,
  RADIUS_LG,
  SHADOW_MD,
} from "../../constants/styles";

export type ToolbarOrientation = "horizontal" | "vertical";

const ToolbarContext = createContext<ToolbarOrientation>("horizontal");

function getOrientationStyles(isVertical: boolean, fitContent: boolean): CSSProperties {
  if (isVertical) {
    return { width: SIZE_TOOLBAR_HEIGHT, padding: `${SPACE_SM} 0`, ...(fitContent && { height: "fit-content" }) };
  }
  return { height: SIZE_TOOLBAR_HEIGHT, padding: `0 ${SPACE_SM}`, ...(fitContent && { width: "fit-content" }) };
}

function getBorderStyle(isVertical: boolean): CSSProperties {
  return isVertical ? { borderRight: `1px solid ${COLOR_BORDER}` } : { borderBottom: `1px solid ${COLOR_BORDER}` };
}

/** Hook to access current toolbar orientation from context */
export function useToolbarOrientation(): ToolbarOrientation {
  return useContext(ToolbarContext);
}

export type ToolbarProps = {
  children: ReactNode;
  variant?: "default" | "floating";
  /** Toolbar orientation */
  orientation?: "horizontal" | "vertical";
  /** When true, toolbar size fits its content instead of filling parent */
  fitContent?: boolean;
  className?: string;
};

export const Toolbar = memo(function Toolbar({
  children,
  variant = "default",
  orientation = "horizontal",
  fitContent = false,
  className,
}: ToolbarProps) {
  const isVertical = orientation === "vertical";

  const style = useMemo<CSSProperties>(() => {
    const baseStyles: CSSProperties = {
      display: fitContent ? "inline-flex" : "flex",
      flexDirection: isVertical ? "column" : "row",
      alignItems: "center",
      backgroundColor: COLOR_SURFACE,
      gap: SPACE_SM,
      ...getOrientationStyles(isVertical, fitContent),
    };

    if (variant === "floating") {
      return {
        ...baseStyles,
        width: isVertical ? "auto" : baseStyles.width,
        height: isVertical ? baseStyles.height : "auto",
        padding: SPACE_MD,
        borderRadius: RADIUS_LG,
        boxShadow: SHADOW_MD,
      };
    }

    return { ...baseStyles, ...getBorderStyle(isVertical) };
  }, [variant, orientation, fitContent, isVertical]);

  return (
    <ToolbarContext.Provider value={orientation}>
      <div
        role="toolbar"
        aria-orientation={orientation}
        className={className}
        style={style}
      >
        {children}
      </div>
    </ToolbarContext.Provider>
  );
});
