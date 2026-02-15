/**
 * @file PropertyRow component - Label and value pair for inspector
 */

import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SIZE_PROPERTY_LABEL,
  SPACE_SM,
  SPACE_MD,
} from "../../constants/styles";

export type PropertyRowProps = {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function PropertyRow({
  label,
  children,
  onClick,
  className,
}: PropertyRowProps) {
  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    padding: `${SPACE_SM} ${SPACE_MD}`,
    cursor: onClick ? "pointer" : "default",
    transition: "background-color 100ms ease",
  };

  const labelStyle: CSSProperties = {
    width: SIZE_PROPERTY_LABEL,
    flexShrink: 0,
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
    lineHeight: 1.4,
  };

  const valueStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    color: COLOR_TEXT,
    fontSize: SIZE_FONT_SM,
    lineHeight: 1.4,
    wordBreak: "break-word",
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    }
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.backgroundColor = "transparent";
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={containerStyle}
    >
      <span style={labelStyle}>{label}</span>
      <span style={valueStyle}>{children}</span>
    </div>
  );
}
