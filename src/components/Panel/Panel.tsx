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

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);






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
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{title}</h3>
        {onClose ? (
          <IconButton
            icon={<CloseIcon />}
            aria-label="Close"
            size="sm"
            onClick={onClose}
          />
        ) : null}
      </div>
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
