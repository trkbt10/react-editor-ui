/**
 * @file SectionHeader component - Collapsible section header
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_TEXT,
  COLOR_ICON,
  FONT_WEIGHT_SEMIBOLD,
  SIZE_FONT_SM,
  SPACE_SM,
  SPACE_MD,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";

const ChevronIcon = memo(function ChevronIcon({
  isExpanded,
}: {
  isExpanded: boolean;
}) {
  const style = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginRight: SPACE_SM,
      color: COLOR_ICON,
      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
      transition: `transform ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [isExpanded],
  );

  return (
    <span style={style}>
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
});

export type SectionHeaderProps = {
  title: string;
  collapsible?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  action?: ReactNode;
  className?: string;
};

export const SectionHeader = memo(function SectionHeader({
  title,
  collapsible = false,
  expanded: controlledExpanded,
  defaultExpanded = true,
  onToggle,
  action,
  className,
}: SectionHeaderProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const [isHovered, setIsHovered] = useState(false);

  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      padding: `${SPACE_SM} ${SPACE_MD}`,
      cursor: collapsible ? "pointer" : "default",
      userSelect: "none",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      backgroundColor: collapsible && isHovered ? COLOR_HOVER : "transparent",
    }),
    [collapsible, isHovered],
  );

  const titleStyle = useMemo<CSSProperties>(
    () => ({
      flex: 1,
      color: COLOR_TEXT,
      fontSize: SIZE_FONT_SM,
      fontWeight: FONT_WEIGHT_SEMIBOLD,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    }),
    [],
  );

  const actionStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      marginLeft: SPACE_SM,
    }),
    [],
  );

  const handleClick = useCallback(() => {
    if (!collapsible) {
      return;
    }

    const newExpanded = !isExpanded;
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    onToggle?.(newExpanded);
  }, [collapsible, isExpanded, isControlled, onToggle]);

  const handlePointerEnter = useCallback(() => {
    if (collapsible) {
      setIsHovered(true);
    }
  }, [collapsible]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleActionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      role={collapsible ? "button" : undefined}
      aria-expanded={collapsible ? isExpanded : undefined}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={containerStyle}
    >
      {collapsible ? <ChevronIcon isExpanded={isExpanded} /> : null}
      <span style={titleStyle}>{title}</span>
      {action ? <span style={actionStyle} onClick={handleActionClick}>{action}</span> : null}
    </div>
  );
});
