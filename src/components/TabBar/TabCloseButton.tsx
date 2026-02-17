/**
 * @file TabCloseButton - Close button for file tabs with dirty indicator
 */

import { memo, useState, useMemo } from "react";
import type { CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_TEXT_MUTED,
  SIZE_CLOSE_BUTTON,
  SIZE_DIRTY_INDICATOR,
  SPACE_SM,
  DURATION_FAST,
  EASING_DEFAULT,
  RADIUS_SM,
  RADIUS_FULL,
} from "../../themes/styles";

// ========================================
// STATIC STYLES
// ========================================

const dirtyDotStyle: CSSProperties = {
  width: SIZE_DIRTY_INDICATOR,
  height: SIZE_DIRTY_INDICATOR,
  marginLeft: SPACE_SM,
  borderRadius: RADIUS_FULL,
  backgroundColor: COLOR_TEXT_MUTED,
  cursor: "pointer",
};

// ========================================
// CLOSE ICON
// ========================================

const CloseIcon = memo(function CloseIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
});

// ========================================
// TAB CLOSE BUTTON
// ========================================

export type TabCloseButtonProps = {
  /** Close handler */
  onClose: () => void;
  /** Whether the tab has unsaved changes */
  isDirty?: boolean;
};

/**
 * Close button for file tabs.
 * Uses span instead of button to avoid nested button issues.
 * Shows dirty dot when isDirty is true and not hovered.
 */
export const TabCloseButton = memo(function TabCloseButton({
  onClose,
  isDirty,
}: TabCloseButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: SIZE_CLOSE_BUTTON,
      height: SIZE_CLOSE_BUTTON,
      marginLeft: SPACE_SM,
      borderRadius: RADIUS_SM,
      backgroundColor: isHovered ? COLOR_HOVER : "transparent",
      color: isHovered ? COLOR_ICON_HOVER : COLOR_ICON,
      cursor: "pointer",
      transition: `all ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [isHovered],
  );

  const handlers = useMemo(
    () => ({
      click: (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose();
      },
      keyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }
      },
      pointerEnter: () => setIsHovered(true),
      pointerLeave: () => setIsHovered(false),
    }),
    [onClose],
  );

  // Show dirty dot when dirty and not hovered
  if (isDirty && !isHovered) {
    return (
      <span
        role="button"
        tabIndex={0}
        style={dirtyDotStyle}
        onPointerEnter={handlers.pointerEnter}
        onPointerLeave={handlers.pointerLeave}
        onClick={handlers.click}
        onKeyDown={handlers.keyDown}
        aria-label="Close tab"
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={handlers.click}
      onPointerEnter={handlers.pointerEnter}
      onPointerLeave={handlers.pointerLeave}
      onKeyDown={handlers.keyDown}
      style={buttonStyle}
      aria-label="Close tab"
    >
      <CloseIcon />
    </span>
  );
});
