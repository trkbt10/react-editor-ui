/**
 * @file TreeItem component - Tree node for hierarchical data
 */

import { memo, useState, useCallback, useMemo } from "react";
import type { ReactNode, CSSProperties, MouseEvent } from "react";
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
import { ChevronRightIcon } from "../../icons";

type ExpanderProps = {
  hasChildren: boolean;
  expanded: boolean;
  expanderStyle: CSSProperties;
  onExpanderClick: (e: MouseEvent<HTMLSpanElement>) => void;
};

const Expander = memo(function Expander({
  hasChildren,
  expanded,
  expanderStyle,
  onExpanderClick,
}: ExpanderProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const placeholderStyle = useMemo<CSSProperties>(
    () => ({
      width: "16px",
      marginRight: SPACE_SM,
      flexShrink: 0,
    }),
    [],
  );

  const computedStyle = useMemo<CSSProperties>(
    () => ({
      ...expanderStyle,
      color: isHovered ? COLOR_ICON_HOVER : COLOR_ICON,
    }),
    [expanderStyle, isHovered],
  );

  if (!hasChildren) {
    return <span style={placeholderStyle} />;
  }

  const ariaLabel = expanded ? "Collapse" : "Expand";

  return (
    <span
      role="button"
      aria-label={ariaLabel}
      onClick={onExpanderClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={computedStyle}
    >
      <ChevronRightIcon size={12} />
    </span>
  );
});

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






export const TreeItem = memo(
  function TreeItem({
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
    const [isHovered, setIsHovered] = useState(false);

    const containerStyle = useMemo<CSSProperties>(() => {
      const getBackgroundColor = (): string => {
        if (selected) {
          return COLOR_SELECTED;
        }
        if (isHovered) {
          return COLOR_HOVER;
        }
        return "transparent";
      };

      return {
        display: "flex",
        alignItems: "center",
        padding: `${SPACE_SM} ${SPACE_MD}`,
        paddingLeft: `calc(${SPACE_MD} + ${SIZE_TREE_INDENT} * ${depth})`,
        backgroundColor: getBackgroundColor(),
        cursor: "pointer",
        transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
        userSelect: "none",
      };
    }, [depth, isHovered, selected]);

    const expanderStyle = useMemo<CSSProperties>(
      () => ({
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
      }),
      [expanded],
    );

    const iconStyle = useMemo<CSSProperties>(
      () => ({
        display: "flex",
        alignItems: "center",
        marginRight: SPACE_SM,
        color: COLOR_ICON,
        flexShrink: 0,
      }),
      [],
    );

    const labelStyle = useMemo<CSSProperties>(
      () => ({
        flex: 1,
        minWidth: 0,
        color: selected ? COLOR_TEXT : COLOR_TEXT_MUTED,
        fontSize: SIZE_FONT_SM,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }),
      [selected],
    );

    const badgeStyle = useMemo<CSSProperties>(
      () => ({
        marginLeft: SPACE_SM,
        flexShrink: 0,
      }),
      [],
    );

    const handlePointerEnter = useCallback(() => {
      setIsHovered(true);
    }, []);

    const handlePointerLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    const handleExpanderClick = useCallback(
      (e: MouseEvent<HTMLSpanElement>) => {
        e.stopPropagation();
        onToggle?.();
      },
      [onToggle],
    );

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
        <Expander
          hasChildren={hasChildren}
          expanded={expanded}
          expanderStyle={expanderStyle}
          onExpanderClick={handleExpanderClick}
        />
        {icon ? <span style={iconStyle}>{icon}</span> : null}
        <span style={labelStyle}>{label}</span>
        {badge ? <span style={badgeStyle}>{badge}</span> : null}
      </div>
    );
  },
  (prev, next) =>
    prev.label === next.label &&
    prev.depth === next.depth &&
    prev.hasChildren === next.hasChildren &&
    prev.expanded === next.expanded &&
    prev.selected === next.selected &&
    prev.icon === next.icon &&
    prev.badge === next.badge &&
    prev.className === next.className &&
    prev.onClick === next.onClick &&
    prev.onToggle === next.onToggle,
);
