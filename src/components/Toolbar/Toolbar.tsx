/**
 * @file Toolbar component - Container for toolbar items
 */

import { memo, useMemo } from "react";
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

export type ToolbarProps = {
  children: ReactNode;
  variant?: "default" | "floating";
  className?: string;
};

export const Toolbar = memo(function Toolbar({
  children,
  variant = "default",
  className,
}: ToolbarProps) {
  const style = useMemo<CSSProperties>(() => {
    const baseStyles: CSSProperties = {
      display: "flex",
      alignItems: "center",
      height: SIZE_TOOLBAR_HEIGHT,
      padding: `0 ${SPACE_SM}`,
      backgroundColor: COLOR_SURFACE,
      gap: SPACE_SM,
    };

    if (variant === "floating") {
      return {
        ...baseStyles,
        height: "auto",
        padding: SPACE_MD,
        gap: SPACE_SM,
        borderRadius: RADIUS_LG,
        boxShadow: SHADOW_MD,
      };
    }

    return {
      ...baseStyles,
      borderBottom: `1px solid ${COLOR_BORDER}`,
    };
  }, [variant]);

  return (
    <div role="toolbar" className={className} style={style}>
      {children}
    </div>
  );
});
