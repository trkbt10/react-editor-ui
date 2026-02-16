/**
 * @file Panel component - Floating settings panel with header and close button
 */

import type { ReactNode, CSSProperties } from "react";
import { IconButton } from "../IconButton/IconButton";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  COLOR_TEXT,
  RADIUS_LG,
  SHADOW_LG,
  SIZE_FONT_MD,
  SIZE_PANEL_HEADER_HEIGHT,
  SPACE_MD,
  SPACE_LG,
} from "../../constants/styles";
import { CloseIcon } from "../../icons";

export type PanelProps = {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  width?: number | string;
  className?: string;
};

function formatWidth(width: number | string): string {
  if (typeof width === "number") {
    return `${width}px`;
  }
  return width;
}

/** Fixed-width side panel container with header, close button, and scrollable content */
export function Panel({
  title,
  children,
  onClose,
  width = 320,
  className,
}: PanelProps) {
  const containerStyle: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    width: formatWidth(width),
    boxSizing: "border-box",
    backgroundColor: COLOR_SURFACE,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_LG,
    boxShadow: SHADOW_LG,
  };

  const headerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: SIZE_PANEL_HEADER_HEIGHT,
    padding: `0 ${SPACE_LG}`,
    borderBottom: `1px solid ${COLOR_BORDER}`,
    boxSizing: "border-box",
  };

  const titleStyle: CSSProperties = {
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_MD,
    fontWeight: 600,
    margin: 0,
  };

  const contentStyle: CSSProperties = {
    padding: SPACE_LG,
    display: "flex",
    flexDirection: "column",
    gap: SPACE_MD,
    overflow: "hidden",
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        {onClose && (
          <IconButton icon={<CloseIcon />} aria-label="Close" size="sm" onClick={onClose} />
        )}
      </div>
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
