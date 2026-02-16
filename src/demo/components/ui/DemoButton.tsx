/**
 * @file Demo button component with variants and sizes
 */

import type { FC, ButtonHTMLAttributes, CSSProperties } from "react";
import { useState, useMemo } from "react";

type DemoButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type DemoButtonSize = "sm" | "md" | "lg";

export type DemoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: DemoButtonVariant;
  size?: DemoButtonSize;
};

const baseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "var(--rei-demo-font-family)",
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  transition: "all 0.2s ease",
  outline: "none",
};

const sizeStyles: Record<DemoButtonSize, CSSProperties> = {
  sm: {
    padding: "6px 12px",
    fontSize: "var(--rei-demo-font-size-sm)",
    borderRadius: "16px",
  },
  md: {
    padding: "10px 20px",
    fontSize: "var(--rei-demo-font-size-md)",
    borderRadius: "24px",
  },
  lg: {
    padding: "14px 28px",
    fontSize: "var(--rei-demo-font-size-lg)",
    borderRadius: "32px",
  },
};

const variantStyles: Record<DemoButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--rei-demo-accent)",
    color: "var(--rei-demo-accent-contrast)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  secondary: {
    background: "rgba(255, 255, 255, 0.8)",
    color: "var(--rei-demo-text-primary)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    backdropFilter: "blur(10px)",
  },
  outline: {
    background: "transparent",
    color: "var(--rei-demo-text-primary)",
    border: "1px solid var(--rei-demo-text-secondary)",
  },
  ghost: {
    background: "transparent",
    color: "var(--rei-demo-text-secondary)",
  },
};

const hoverVariantStyles: Record<DemoButtonVariant, CSSProperties> = {
  primary: {
    transform: "scale(1.03)",
  },
  secondary: {
    background: "rgba(255, 255, 255, 1)",
    transform: "scale(1.03)",
  },
  outline: {
    transform: "scale(1.03)",
  },
  ghost: {
    transform: "scale(1.03)",
  },
};

export const DemoButton: FC<DemoButtonProps> = ({
  variant = "primary",
  size = "md",
  style,
  disabled,
  children,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const combinedStyle = useMemo<CSSProperties>(
    () => ({
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(isHovered && !disabled ? hoverVariantStyles[variant] : {}),
      ...(disabled ? { opacity: 0.5, cursor: "not-allowed" } : {}),
      ...style,
    }),
    [variant, size, isHovered, disabled, style],
  );

  return (
    <button
      style={combinedStyle}
      disabled={disabled}
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
    </button>
  );
};
