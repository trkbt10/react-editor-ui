/**
 * @file PropertyRow component - Label and value pair for inspector
 *
 * @description
 * Displays property name and value in a consistent layout.
 * Used in inspector panels for editing object properties.
 *
 * @example
 * ```tsx
 * import { PropertyRow } from "react-editor-ui/PropertyRow";
 * import { Input } from "react-editor-ui/Input";
 *
 * <PropertyRow label="Width">
 *   <Input value="100" onChange={() => {}} suffix="px" />
 * </PropertyRow>
 * ```
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SIZE_PROPERTY_LABEL,
  SPACE_SM,
  SPACE_MD,
} from "../../themes/styles";

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

export type PropertyRowProps = {
  label: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export const PropertyRow = memo(function PropertyRow({
  label,
  children,
  onClick,
  className,
}: PropertyRowProps) {
  const [isHovered, setIsHovered] = useState(false);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "flex-start",
      padding: `${SPACE_SM} ${SPACE_MD}`,
      cursor: onClick ? "pointer" : "default",
      transition: "background-color 100ms ease",
      backgroundColor: onClick && isHovered ? COLOR_HOVER : "transparent",
    }),
    [onClick, isHovered],
  );

  const handlePointerEnter = useCallback(() => {
    if (onClick) {
      setIsHovered(true);
    }
  }, [onClick]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

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
});
