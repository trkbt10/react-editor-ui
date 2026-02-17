/**
 * @file ProjectMenu component - Sidebar project dropdown with status badges
 *
 * @description
 * Displays project name with status badges in a compact dropdown format.
 * Designed for sidebar use, extends SectionHeader patterns.
 *
 * @example
 * ```tsx
 * import { ProjectMenu } from "react-editor-ui/ProjectMenu";
 *
 * <ProjectMenu
 *   name="My Project"
 *   badges={[
 *     { label: "Drafts" },
 *     { label: "Free", variant: "accent" },
 *   ]}
 *   onClick={() => openProjectMenu()}
 * />
 * ```
 */

import { memo, useMemo, useCallback, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_HOVER,
  COLOR_ICON,
  COLOR_PRIMARY,
  FONT_WEIGHT_SEMIBOLD,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";

export type ProjectMenuBadge = {
  label: string;
  variant?: "default" | "accent" | "warning" | "success";
  icon?: ReactNode;
};

export type ProjectMenuProps = {
  name: string;
  icon?: ReactNode;
  badges?: ProjectMenuBadge[];
  description?: string;
  onClick?: () => void;
  action?: ReactNode;
  className?: string;
};

const ChevronIcon = memo(function ChevronIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
});

const Badge = memo(function Badge({ badge }: { badge: ProjectMenuBadge }) {
  const colorMap: Record<NonNullable<ProjectMenuBadge["variant"]>, string> = {
    default: COLOR_TEXT_MUTED,
    accent: COLOR_PRIMARY,
    warning: "#f59e0b",
    success: "#22c55e",
  };

  const style = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      gap: SPACE_XS,
      color: colorMap[badge.variant ?? "default"],
      fontSize: SIZE_FONT_XS,
    }),
    [badge.variant],
  );

  return (
    <span style={style}>
      {badge.icon}
      {badge.label}
    </span>
  );
});

export const ProjectMenu = memo(function ProjectMenu({
  name,
  icon,
  badges,
  description,
  onClick,
  action,
  className,
}: ProjectMenuProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isClickable = !!onClick;

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: `${SPACE_SM} ${SPACE_MD}`,
      cursor: isClickable ? "pointer" : "default",
      userSelect: "none",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      backgroundColor: isClickable && isHovered ? COLOR_HOVER : "transparent",
    }),
    [isClickable, isHovered],
  );

  const contentStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      flexDirection: "column",
      gap: 2,
      flex: 1,
      minWidth: 0,
    }),
    [],
  );

  const headerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_XS,
    }),
    [],
  );

  const nameStyle = useMemo<CSSProperties>(
    () => ({
      color: COLOR_TEXT,
      fontSize: SIZE_FONT_SM,
      fontWeight: FONT_WEIGHT_SEMIBOLD,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),
    [],
  );

  const iconStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      color: COLOR_ICON,
      flexShrink: 0,
    }),
    [],
  );

  const chevronStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      color: COLOR_ICON,
      flexShrink: 0,
    }),
    [],
  );

  const badgesStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_SM,
      marginTop: 2,
    }),
    [],
  );

  const descriptionStyle = useMemo<CSSProperties>(
    () => ({
      color: COLOR_TEXT_MUTED,
      fontSize: SIZE_FONT_XS,
      marginTop: 2,
    }),
    [],
  );

  const actionStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      marginLeft: SPACE_SM,
      flexShrink: 0,
    }),
    [],
  );

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const handlePointerEnter = useCallback(() => {
    if (isClickable) {
      setIsHovered(true);
    }
  }, [isClickable]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleActionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      role={isClickable ? "button" : undefined}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={className}
      style={containerStyle}
    >
      <div style={contentStyle}>
        <div style={headerStyle}>
          {icon ? <span style={iconStyle}>{icon}</span> : null}
          <span style={nameStyle}>{name}</span>
          {isClickable ? <span style={chevronStyle}><ChevronIcon /></span> : null}
        </div>
        {badges && badges.length > 0 && (
          <div style={badgesStyle}>
            {badges.map((badge, i) => <Badge key={`${badge.label}-${i}`} badge={badge} />)}
          </div>
        )}
        {description ? <div style={descriptionStyle}>{description}</div> : null}
      </div>
      {action ? <span style={actionStyle} onClick={handleActionClick}>{action}</span> : null}
    </div>
  );
});
