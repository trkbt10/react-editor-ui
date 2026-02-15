/**
 * @file StatusBarItem component - Individual status bar item
 */

import type { ReactNode, CSSProperties, PointerEvent } from "react";
import {
  COLOR_HOVER,
  COLOR_TEXT_MUTED,
  COLOR_TEXT,
  SIZE_FONT_XS,
  SPACE_XS,
  SPACE_SM,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";

export type StatusBarItemProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
};

export function StatusBarItem({
  children,
  onClick,
  className,
}: StatusBarItemProps) {
  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: SPACE_XS,
    padding: `${SPACE_XS} ${SPACE_SM}`,
    backgroundColor: "transparent",
    color: COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_XS,
    border: "none",
    borderRadius: RADIUS_SM,
    cursor: onClick ? "pointer" : "default",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}, color ${DURATION_FAST} ${EASING_DEFAULT}`,
    whiteSpace: "nowrap",
  };

  const handlePointerEnter = (
    e: PointerEvent<HTMLButtonElement | HTMLSpanElement>,
  ) => {
    if (onClick) {
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
      e.currentTarget.style.color = COLOR_TEXT;
    }
  };

  const handlePointerLeave = (
    e: PointerEvent<HTMLButtonElement | HTMLSpanElement>,
  ) => {
    if (onClick) {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = COLOR_TEXT_MUTED;
    }
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        className={className}
        style={style}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
