/**
 * @file TreeItem component - Tree node for hierarchical data
 */

import type { ReactNode, CSSProperties, MouseEvent, PointerEvent } from "react";
import {
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  SIZE_FONT_SM,
  SIZE_TREE_INDENT,
  SPACE_SM,
  SPACE_MD,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";

function renderExpander(
  hasChildren: boolean,
  expanded: boolean,
  expanderStyle: CSSProperties,
  handleExpanderClick: (e: MouseEvent<HTMLSpanElement>) => void,
) {
  if (!hasChildren) {
    return <span style={{ width: "16px", marginRight: SPACE_SM, flexShrink: 0 }} />;
  }
  const ariaLabel = expanded ? "Collapse" : "Expand";
  return (
    <span
      role="button"
      aria-label={ariaLabel}
      onClick={handleExpanderClick}
      onPointerEnter={(e) => {
        e.currentTarget.style.color = COLOR_ICON_HOVER;
      }}
      onPointerLeave={(e) => {
        e.currentTarget.style.color = COLOR_ICON;
      }}
      style={expanderStyle}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </span>
  );
}

export type TreeItemProps = {
  label: string;
  icon?: ReactNode;
  depth?: number;
  hasChildren?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  selected?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
  className?: string;
};

export function TreeItem({
  label,
  icon,
  depth = 0,
  hasChildren = false,
  expanded = false,
  onToggle,
  selected = false,
  onClick,
  badge,
  className,
}: TreeItemProps) {
  const containerStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    padding: `${SPACE_SM} ${SPACE_MD}`,
    paddingLeft: `calc(${SPACE_MD} + ${SIZE_TREE_INDENT} * ${depth})`,
    backgroundColor: selected ? COLOR_SELECTED : "transparent",
    cursor: "pointer",
    transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    userSelect: "none",
  };

  const expanderStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "16px",
    marginRight: SPACE_SM,
    color: COLOR_ICON,
    flexShrink: 0,
    transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
    transition: `transform ${DURATION_FAST} ${EASING_DEFAULT}`,
  };

  const iconStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    marginRight: SPACE_SM,
    color: COLOR_ICON,
    flexShrink: 0,
  };

  const labelStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    color: selected ? COLOR_TEXT : COLOR_TEXT_MUTED,
    fontSize: SIZE_FONT_SM,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const badgeStyle: CSSProperties = {
    marginLeft: SPACE_SM,
    flexShrink: 0,
  };

  const handlePointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (!selected) {
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    }
  };

  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (!selected) {
      e.currentTarget.style.backgroundColor = "transparent";
    }
  };

  const handleExpanderClick = (e: MouseEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    onToggle?.();
  };

  return (
    <div
      role="treeitem"
      aria-selected={selected}
      aria-expanded={hasChildren ? expanded : undefined}
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={containerStyle}
    >
      {renderExpander(hasChildren, expanded, expanderStyle, handleExpanderClick)}
      {icon ? <span style={iconStyle}>{icon}</span> : null}
      <span style={labelStyle}>{label}</span>
      {badge ? <span style={badgeStyle}>{badge}</span> : null}
    </div>
  );
}
