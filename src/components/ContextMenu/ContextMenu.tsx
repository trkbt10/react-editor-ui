/**
 * @file ContextMenu component - Reusable context menu for right-click actions
 */

import { memo, useState, useMemo, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { ReactNode, CSSProperties } from "react";
import {
  COLOR_HOVER,
  COLOR_TEXT,
  COLOR_TEXT_DISABLED,
  COLOR_BORDER,
  COLOR_ERROR,
  SIZE_FONT_MD,
  SPACE_SM,
  SPACE_MD,
  SPACE_LG,
  RADIUS_SM,
  RADIUS_LG,
  SHADOW_MD,
  COLOR_INPUT_BG,
  Z_POPOVER,
} from "../../themes/styles";
import { ChevronRightIcon } from "../../icons";

export type ContextMenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  shortcut?: string;
  children?: ContextMenuItem[];
};

export type ContextMenuProps = {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onSelect: (itemId: string) => void;
  onClose: () => void;
  className?: string;
  maxHeight?: number;
  nestLevel?: number;
};

const DEFAULT_MAX_HEIGHT = 300;
const SUBMENU_OFFSET = 4;

type MenuItemProps = {
  item: ContextMenuItem;
  isSubmenuOpen: boolean;
  onItemClick: (itemId: string, disabled?: boolean, hasChildren?: boolean) => void;
  onItemHover: (item: ContextMenuItem, rect: DOMRect | null) => void;
};

const MenuItem = memo(function MenuItem({
  item,
  isSubmenuOpen,
  onItemClick,
  onItemHover,
}: MenuItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const hasChildren = item.children && item.children.length > 0;

  const getItemColor = (): string => {
    if (item.danger) {
      return COLOR_ERROR;
    }
    if (item.disabled) {
      return COLOR_TEXT_DISABLED;
    }
    return COLOR_TEXT;
  };

  const itemStyle = useMemo<CSSProperties>(() => {
    const shouldHighlight = isHovered || isSubmenuOpen;
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: SPACE_MD,
      padding: `${SPACE_MD} ${SPACE_LG}`,
      fontSize: SIZE_FONT_MD,
      color: getItemColor(),
      cursor: item.disabled ? "default" : "pointer",
      borderRadius: RADIUS_SM,
      border: "none",
      background: shouldHighlight && !item.disabled ? COLOR_HOVER : "transparent",
      width: "100%",
      textAlign: "left",
      opacity: item.disabled ? 0.5 : 1,
    };
  }, [isHovered, isSubmenuOpen, item.disabled, item.danger]);

  const handleClick = useCallback(() => {
    onItemClick(item.id, item.disabled, hasChildren);
  }, [onItemClick, item.id, item.disabled, hasChildren]);

  const handlePointerEnter = useCallback(() => {
    if (!item.disabled) {
      setIsHovered(true);
    }
    const rect = buttonRef.current?.getBoundingClientRect() ?? null;
    onItemHover(item, rect);
  }, [item, onItemHover]);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const shortcutStyle = useMemo<CSSProperties>(
    () => ({
      fontSize: SIZE_FONT_MD,
      color: COLOR_TEXT_DISABLED,
      marginLeft: "auto",
      flexShrink: 0,
    }),
    [],
  );

  const chevronStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      color: COLOR_TEXT_DISABLED,
      flexShrink: 0,
    }),
    [],
  );

  const contentContainerStyle = useMemo<CSSProperties>(
    () => ({ display: "flex", alignItems: "center", gap: SPACE_MD, overflow: "hidden" }),
    [],
  );

  const iconWrapperStyle = useMemo<CSSProperties>(
    () => ({ display: "flex", flexShrink: 0 }),
    [],
  );

  const labelStyle = useMemo<CSSProperties>(
    () => ({ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }),
    [],
  );

  return (
    <button
      ref={buttonRef}
      role="menuitem"
      aria-haspopup={hasChildren ? "menu" : undefined}
      aria-expanded={hasChildren && isSubmenuOpen ? true : undefined}
      disabled={item.disabled}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      style={itemStyle}
      data-testid={`context-menu-item-${item.id}`}
    >
      <span style={contentContainerStyle}>
        {item.icon ? <span style={iconWrapperStyle}>{item.icon}</span> : null}
        <span style={labelStyle}>
          {item.label}
        </span>
      </span>
      {item.shortcut && !hasChildren ? <span style={shortcutStyle}>{item.shortcut}</span> : null}
      {hasChildren ? <span style={chevronStyle}><ChevronRightIcon /></span> : null}
    </button>
  );
});

export const ContextMenu = memo(function ContextMenu({
  items,
  position,
  onSelect,
  onClose,
  className,
  maxHeight = DEFAULT_MAX_HEIGHT,
  nestLevel = 0,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [openSubmenuId, setOpenSubmenuId] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (nestLevel > 0) {
      return;
    }

    const handleClickOutside = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, nestLevel]);

  useEffect(() => {
    if (!menuRef.current) {
      return;
    }

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const computeAdjustedX = () => {
      const margin = 8;
      if (position.x + rect.width > viewportWidth) {
        if (nestLevel > 0) {
          const flipped = position.x - rect.width - SUBMENU_OFFSET;
          return Math.max(flipped, margin);
        }
        return viewportWidth - rect.width - margin;
      }
      return Math.max(position.x, margin);
    };

    const computeAdjustedY = () => {
      const margin = 8;
      if (position.y + rect.height > viewportHeight) {
        return viewportHeight - rect.height - margin;
      }
      return Math.max(position.y, margin);
    };

    menu.style.left = `${computeAdjustedX()}px`;
    menu.style.top = `${computeAdjustedY()}px`;
  }, [position, nestLevel]);

  const handleItemClick = useCallback(
    (itemId: string, disabled?: boolean, hasChildren?: boolean) => {
      if (disabled) {
        return;
      }
      if (hasChildren) {
        return;
      }
      onSelect(itemId);
      onClose();
    },
    [onSelect, onClose],
  );

  const handleItemHover = useCallback((item: ContextMenuItem, rect: DOMRect | null) => {
    if (item.children && item.children.length > 0 && rect) {
      setOpenSubmenuId(item.id);
      setSubmenuPosition({
        x: rect.right + SUBMENU_OFFSET,
        y: rect.top,
      });
    } else {
      setOpenSubmenuId(null);
      setSubmenuPosition(null);
    }
  }, []);

  const handleSubmenuSelect = useCallback(
    (itemId: string) => {
      onSelect(itemId);
      onClose();
    },
    [onSelect, onClose],
  );

  const menuStyle = useMemo<CSSProperties>(
    () => ({
      position: "fixed",
      left: position.x,
      top: position.y,
      backgroundColor: COLOR_INPUT_BG,
      border: `1px solid ${COLOR_BORDER}`,
      borderRadius: RADIUS_LG,
      padding: SPACE_SM,
      minWidth: "180px",
      maxWidth: "320px",
      maxHeight: `${maxHeight}px`,
      overflowY: "auto",
      overflowX: "hidden",
      zIndex: Z_POPOVER + nestLevel,
      boxShadow: SHADOW_MD,
    }),
    [position.x, position.y, maxHeight, nestLevel],
  );

  const dividerStyle = useMemo<CSSProperties>(
    () => ({
      height: "1px",
      backgroundColor: COLOR_BORDER,
      margin: `${SPACE_SM} 0`,
    }),
    [],
  );

  const renderSubmenu = () => {
    if (!openSubmenuId || !submenuPosition) {
      return null;
    }
    const parentItem = items.find((i) => i.id === openSubmenuId);
    if (!parentItem?.children) {
      return null;
    }
    return (
      <ContextMenu
        items={parentItem.children}
        position={submenuPosition}
        onSelect={handleSubmenuSelect}
        onClose={onClose}
        maxHeight={maxHeight}
        nestLevel={nestLevel + 1}
      />
    );
  };

  const menuElement = (
    <div
      ref={menuRef}
      role="menu"
      className={className}
      style={menuStyle}
      data-testid={nestLevel === 0 ? "context-menu" : `context-submenu-${nestLevel}`}
      data-nest-level={nestLevel}
    >
      {items.map((item) => {
        if (item.divider) {
          return <div key={item.id} style={dividerStyle} role="separator" />;
        }

        return (
          <MenuItem
            key={item.id}
            item={item}
            isSubmenuOpen={openSubmenuId === item.id}
            onItemClick={handleItemClick}
            onItemHover={handleItemHover}
          />
        );
      })}
      {renderSubmenu()}
    </div>
  );

  // Use portal to escape stacking context issues
  if (nestLevel === 0) {
    return createPortal(menuElement, document.body);
  }

  return menuElement;
});
