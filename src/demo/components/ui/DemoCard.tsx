/**
 * @file Demo card component with optional hover effect
 */

import type { FC, HTMLAttributes, CSSProperties } from "react";
import { useState, useMemo } from "react";

export type DemoCardProps = HTMLAttributes<HTMLDivElement> & {
  hoverEffect?: boolean;
};

const cardStyle: CSSProperties = {
  background: "var(--rei-demo-card-bg)",
  backdropFilter: "blur(20px)",
  borderRadius: "var(--rei-demo-radius-xl)",
  padding: "var(--rei-demo-space-lg)",
  boxShadow: "var(--rei-demo-shadow-md)",
  border: "1px solid var(--rei-demo-card-border)",
  transition: "var(--rei-demo-transition)",
  position: "relative",
  overflow: "hidden",
};

const hoverStyle: CSSProperties = {
  transform: "translateY(-4px)",
  boxShadow: "var(--rei-demo-shadow-lg)",
};

export const DemoCard: FC<DemoCardProps> = ({
  hoverEffect = false,
  style,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const combinedStyle = useMemo<CSSProperties>(
    () => ({
      ...cardStyle,
      ...(hoverEffect && isHovered ? hoverStyle : {}),
      ...style,
    }),
    [hoverEffect, isHovered, style],
  );

  return (
    <div
      style={combinedStyle}
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
};
