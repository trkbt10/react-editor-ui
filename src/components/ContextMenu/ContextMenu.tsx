/**
 * @file ContextMenu component - Reusable context menu for right-click actions
 */

import type { ReactNode, CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useCallback, useState } from "react";
import {
  COLOR_HOVER,
  COLOR_TEXT,
  COLOR_TEXT_DISABLED,
  COLOR_BORDER,
  COLOR_ERROR,
  SIZE_FONT_SM,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  RADIUS_SM,
  SHADOW_MD,
  COLOR_INPUT_BG,
  Z_POPOVER,
} from "../../constants/styles";

export type ContextMenuItem = {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Disabled state */
  disabled?: boolean;
  /** Danger/destructive action */
  danger?: boolean;
  /** Render as divider instead of item */
  divider?: boolean;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Nested submenu items */
  children?: ContextMenuItem[];
};

export type ContextMenuProps = {
  /** Menu items */
  items: ContextMenuItem[];
  /** Position to display the menu */
  position: { x: number; y: number };
  /** Called when an item is selected */
  onSelect: (itemId: string) => void;
  /** Called when the menu should close */
  onClose: () => void;
  /** Additional class name */
  className?: string;
  /** Maximum height before scrolling (default: 300px) */
  maxHeight?: number;
  /** Nest level (internal use for submenus) */
  nestLevel?: number;
};

// Default maximum height for scrollable content
const DEFAULT_MAX_HEIGHT = 300;
const SUBMENU_OFFSET = 4;

// Chevron icon for submenu indicator
function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/**
 * ContextMenu component with viewport boundary handling, scrollable content, and nested submenus
 */
export function ContextMenu({
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

  // Close on outside click or escape (only for root menu)
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

  // Adjust position to stay within viewport
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
      // Check if overflowing right edge
      if (position.x + rect.width > viewportWidth) {
        if (nestLevel > 0) {
          // For submenus, flip to the left side of parent
          const flipped = position.x - rect.width - SUBMENU_OFFSET;
          return Math.max(flipped, margin);
        }
        return viewportWidth - rect.width - margin;
      }
      return Math.max(position.x, margin);
    };

    const computeAdjustedY = () => {
      const margin = 8;
      // Check if overflowing bottom edge
      if (position.y + rect.height > viewportHeight) {
        return viewportHeight - rect.height - margin;
      }
      return Math.max(position.y, margin);
    };

    menu.style.left = `${computeAdjustedX()}px`;
    menu.style.top = `${computeAdjustedY()}px`;
  }, [position, nestLevel]);

  const handleItemClick = useCallback((itemId: string, disabled?: boolean, hasChildren?: boolean) => {
    if (disabled) {
      return;
    }
    if (hasChildren) {
      return; // Don't close menu when clicking item with submenu
    }
    onSelect(itemId);
    onClose();
  }, [onSelect, onClose]);

  const handlePointerEnter = useCallback((e: ReactPointerEvent<HTMLButtonElement>, item: ContextMenuItem) => {
    if (!item.disabled) {
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    }

    // Show submenu if item has children
    if (item.children && item.children.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
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

  const handlePointerLeave = useCallback((e: ReactPointerEvent<HTMLButtonElement>, item: ContextMenuItem) => {
    if (!item.disabled) {
      e.currentTarget.style.backgroundColor = "transparent";
    }
    // Don't close submenu on pointer leave - let it stay open until another item is hovered
  }, []);

  const handleSubmenuSelect = useCallback((itemId: string) => {
    onSelect(itemId);
    onClose();
  }, [onSelect, onClose]);

  const menuStyle: CSSProperties = {
    position: "fixed",
    left: position.x,
    top: position.y,
    backgroundColor: COLOR_INPUT_BG,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_SM,
    padding: SPACE_XS,
    minWidth: "160px",
    maxWidth: "280px",
    maxHeight: `${maxHeight}px`,
    overflowY: "auto",
    overflowX: "hidden",
    zIndex: Z_POPOVER + nestLevel,
    boxShadow: SHADOW_MD,
  };

  const itemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACE_SM,
    padding: `${SPACE_SM} ${SPACE_MD}`,
    fontSize: SIZE_FONT_SM,
    color: COLOR_TEXT,
    cursor: "pointer",
    borderRadius: RADIUS_SM,
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
  };

  const dividerStyle: CSSProperties = {
    height: "1px",
    backgroundColor: COLOR_BORDER,
    margin: `${SPACE_XS} 0`,
  };

  const shortcutStyle: CSSProperties = {
    fontSize: SIZE_FONT_SM,
    color: COLOR_TEXT_DISABLED,
    marginLeft: "auto",
    flexShrink: 0,
  };

  const getItemColor = (item: ContextMenuItem) => {
    if (item.danger) {
      return COLOR_ERROR;
    }
    if (item.disabled) {
      return COLOR_TEXT_DISABLED;
    }
    return COLOR_TEXT;
  };

  return (
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

        const hasChildren = item.children && item.children.length > 0;

        return (
          <button
            key={item.id}
            role="menuitem"
            aria-haspopup={hasChildren ? "menu" : undefined}
            aria-expanded={hasChildren && openSubmenuId === item.id ? true : undefined}
            disabled={item.disabled}
            onClick={() => handleItemClick(item.id, item.disabled, hasChildren)}
            onPointerEnter={(e) => handlePointerEnter(e, item)}
            onPointerLeave={(e) => handlePointerLeave(e, item)}
            style={{
              ...itemStyle,
              color: getItemColor(item),
              cursor: item.disabled ? "default" : "pointer",
              opacity: item.disabled ? 0.5 : 1,
              backgroundColor: openSubmenuId === item.id ? COLOR_HOVER : "transparent",
            }}
            data-testid={`context-menu-item-${item.id}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: SPACE_SM, overflow: "hidden" }}>
              {item.icon ? <span style={{ display: "flex", flexShrink: 0 }}>{item.icon}</span> : null}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {item.label}
              </span>
            </span>
            {item.shortcut && !hasChildren && (
              <span style={shortcutStyle}>{item.shortcut}</span>
            )}
            {hasChildren && (
              <span style={{ display: "flex", color: COLOR_TEXT_DISABLED, flexShrink: 0 }}>
                <ChevronRightIcon />
              </span>
            )}
          </button>
        );
      })}

      {/* Render submenu */}
      {renderSubmenu()}
    </div>
  );

  function renderSubmenu() {
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
  }
}
