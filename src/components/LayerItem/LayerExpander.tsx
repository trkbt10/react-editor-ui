/**
 * @file LayerExpander - Expand/collapse toggle for layer items with children
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { memo, useMemo, useCallback } from "react";
import {
  COLOR_ICON,
  COLOR_ICON_HOVER,
  SIZE_EXPANDER,
  SPACE_XS,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";
import { baseTokens } from "../../themes/tokens";

// Icon size as number (icons require numeric size)
const CHEVRON_SIZE = parseInt(baseTokens["size-icon-sm"], 10);
import { ChevronRightIcon } from "../../icons";

// ========================================
// STATIC STYLES
// ========================================

const expanderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: SIZE_EXPANDER,
  height: SIZE_EXPANDER,
  marginRight: SPACE_XS,
  color: COLOR_ICON,
  cursor: "pointer",
  flexShrink: 0,
};

const expanderPlaceholderStyle: CSSProperties = {
  width: SIZE_EXPANDER,
  marginRight: SPACE_XS,
  flexShrink: 0,
};

// ========================================
// CHEVRON ICON
// ========================================

const ChevronIcon = memo(function ChevronIcon({ expanded }: { expanded: boolean }) {
  const style = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
      transition: `transform ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [expanded],
  );

  return (
    <span style={style}>
      <ChevronRightIcon size={CHEVRON_SIZE} />
    </span>
  );
});

// ========================================
// LAYER EXPANDER
// ========================================

export type LayerExpanderProps = {
  /** Whether this item has children (shows expander if true) */
  hasChildren: boolean;
  /** Current expanded state */
  expanded: boolean;
  /** Toggle handler */
  onToggle?: () => void;
};

/**
 * Expand/collapse toggle button for layer items.
 * Renders a placeholder when hasChildren is false.
 */
export const LayerExpander = memo(function LayerExpander({
  hasChildren,
  expanded,
  onToggle,
}: LayerExpanderProps) {
  const handleClick = useCallback(
    (e: ReactPointerEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      onToggle?.();
    },
    [onToggle],
  );

  const hoverHandlers = useMemo(
    () => ({
      enter: (e: ReactPointerEvent<HTMLSpanElement>) => {
        e.currentTarget.style.color = COLOR_ICON_HOVER;
      },
      leave: (e: ReactPointerEvent<HTMLSpanElement>) => {
        e.currentTarget.style.color = COLOR_ICON;
      },
    }),
    [],
  );

  if (!hasChildren) {
    return <span style={expanderPlaceholderStyle} />;
  }

  return (
    <span
      role="button"
      aria-label={expanded ? "Collapse" : "Expand"}
      onClick={handleClick}
      onPointerEnter={hoverHandlers.enter}
      onPointerLeave={hoverHandlers.leave}
      style={expanderStyle}
    >
      <ChevronIcon expanded={expanded} />
    </span>
  );
});
