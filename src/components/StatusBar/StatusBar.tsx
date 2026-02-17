/**
 * @file StatusBar component - Bottom status bar container
 */

import { memo, useMemo } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  SIZE_STATUSBAR_HEIGHT,
  SPACE_SM,
} from "../../themes/styles";

export type StatusBarProps = {
  children: ReactNode;
  className?: string;
};

/** Application status bar container at bottom of editor window */
export const StatusBar = memo(function StatusBar({ children, className }: StatusBarProps) {
  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      height: SIZE_STATUSBAR_HEIGHT,
      padding: `0 ${SPACE_SM}`,
      backgroundColor: COLOR_SURFACE,
      borderTop: `1px solid ${COLOR_BORDER}`,
      gap: SPACE_SM,
    }),
    [],
  );

  return (
    <div role="status" className={className} style={style}>
      {children}
    </div>
  );
});
