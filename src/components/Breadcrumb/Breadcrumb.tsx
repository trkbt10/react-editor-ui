/**
 * @file Breadcrumb component - Navigation path indicator
 *
 * @description
 * Displays hierarchical navigation path with clickable items.
 * Supports icons, custom separators, and overflow handling.
 *
 * @example
 * ```tsx
 * import { Breadcrumb } from "react-editor-ui/Breadcrumb";
 *
 * <Breadcrumb
 *   items={[
 *     { label: "Project", icon: <LuFolder /> },
 *     { label: "src", icon: <LuFolder /> },
 *     { label: "index.tsx", icon: <LuFileCode /> },
 *   ]}
 *   onItemClick={(index) => navigateTo(index)}
 * />
 * ```
 */

import { memo, useMemo, useCallback, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_ICON,
  COLOR_HOVER,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
  SPACE_XS,
  RADIUS_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../constants/styles";

export type BreadcrumbItem = {
  label: string;
  icon?: ReactNode;
  href?: string;
};

export type BreadcrumbProps = {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  size?: "sm" | "md";
  maxItems?: number;
  onItemClick?: (index: number) => void;
  className?: string;
};

const DefaultSeparator = memo(function DefaultSeparator() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
});

type BreadcrumbItemButtonProps = {
  item: BreadcrumbItem;
  index: number;
  isLast: boolean;
  size: "sm" | "md";
  onClick?: (index: number) => void;
};

const BreadcrumbItemButton = memo(function BreadcrumbItemButton({
  item,
  index,
  isLast,
  size,
  onClick,
}: BreadcrumbItemButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isClickable = !!onClick && !isLast;

  const style = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      gap: SPACE_XS,
      padding: `2px ${SPACE_XS}`,
      margin: `-2px -${SPACE_XS}`,
      border: "none",
      borderRadius: RADIUS_SM,
      backgroundColor: isHovered && isClickable ? COLOR_HOVER : "transparent",
      color: isLast ? COLOR_TEXT : COLOR_TEXT_MUTED,
      fontSize: size === "sm" ? SIZE_FONT_XS : SIZE_FONT_SM,
      cursor: isClickable ? "pointer" : "default",
      whiteSpace: "nowrap",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [isHovered, isClickable, isLast, size],
  );

  const iconStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      color: isLast ? "inherit" : COLOR_ICON,
    }),
    [isLast],
  );

  const handleClick = useCallback(() => {
    if (isClickable) {
      onClick(index);
    }
  }, [isClickable, onClick, index]);

  const handlePointerEnter = useCallback(() => {
    if (isClickable) {
      setIsHovered(true);
    }
  }, [isClickable]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const getElementProps = () => {
    if (item.href) {
      return { href: item.href };
    }
    return { type: "button" as const, onClick: handleClick };
  };

  const Element = item.href ? "a" : "button";

  return (
    <Element
      {...getElementProps()}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={style}
    >
      {item.icon ? <span style={iconStyle}>{item.icon}</span> : null}
      <span>{item.label}</span>
    </Element>
  );
});

export const Breadcrumb = memo(function Breadcrumb({
  items,
  separator,
  size = "sm",
  maxItems,
  onItemClick,
  className,
}: BreadcrumbProps) {
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: SPACE_XS,
      overflow: "hidden",
    }),
    [],
  );

  const separatorStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      color: COLOR_ICON,
      flexShrink: 0,
    }),
    [],
  );

  // Handle maxItems - show first item, ellipsis, and last items
  const displayItems = useMemo(() => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));
    return [firstItem, { label: "...", isEllipsis: true } as BreadcrumbItem & { isEllipsis?: boolean }, ...lastItems];
  }, [items, maxItems]);

  const getOriginalIndex = (index: number): number => {
    const isOverflowing = maxItems && items.length > maxItems && index > 1;
    return isOverflowing ? items.length - (displayItems.length - index) : index;
  };

  const renderSeparator = () => (
    <span style={{ ...separatorStyle, margin: `0 ${SPACE_XS}` }}>
      {separator ?? <DefaultSeparator />}
    </span>
  );

  const renderEllipsis = () => {
    const fontSize = size === "sm" ? SIZE_FONT_XS : SIZE_FONT_SM;
    return <span style={{ color: COLOR_TEXT_MUTED, fontSize }}>...</span>;
  };

  const renderItem = (item: BreadcrumbItem, index: number) => {
    const isLast = index === displayItems.length - 1;
    const originalIndex = getOriginalIndex(index);
    const typedItem = item as BreadcrumbItem & { isEllipsis?: boolean };

    if (typedItem.isEllipsis) {
      return renderEllipsis();
    }

    return (
      <BreadcrumbItemButton
        item={item}
        index={originalIndex}
        isLast={isLast}
        size={size}
        onClick={onItemClick}
      />
    );
  };

  return (
    <nav aria-label="Breadcrumb" className={className} style={containerStyle}>
      {displayItems.map((item, index) => (
        <span key={`${item.label}-${index}`} style={{ display: "flex", alignItems: "center" }}>
          {index > 0 ? renderSeparator() : null}
          {renderItem(item, index)}
        </span>
      ))}
    </nav>
  );
});
