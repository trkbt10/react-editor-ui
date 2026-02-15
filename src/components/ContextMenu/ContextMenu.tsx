/**
 * @file ContextMenu component - Reusable context menu for right-click actions
 */

import type { ReactNode, CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef, useCallback } from "react";
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
};

export function ContextMenu({
  items,
  position,
  onSelect,
  onClose,
  className,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click or escape
  useEffect(() => {
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
  }, [onClose]);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = position.x;
    let adjustedY = position.y;

    if (position.x + rect.width > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 8;
    }
    if (position.y + rect.height > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 8;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [position]);

  const handleItemClick = useCallback((itemId: string, disabled?: boolean) => {
    if (disabled) return;
    onSelect(itemId);
    onClose();
  }, [onSelect, onClose]);

  const handlePointerEnter = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = COLOR_HOVER;
  }, []);

  const handlePointerLeave = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
  }, []);

  const menuStyle: CSSProperties = {
    position: "fixed",
    left: position.x,
    top: position.y,
    backgroundColor: COLOR_INPUT_BG,
    border: `1px solid ${COLOR_BORDER}`,
    borderRadius: RADIUS_SM,
    padding: SPACE_XS,
    minWidth: "160px",
    zIndex: Z_POPOVER,
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
  };

  return (
    <div
      ref={menuRef}
      role="menu"
      className={className}
      style={menuStyle}
      data-testid="context-menu"
    >
      {items.map((item) => {
        if (item.divider) {
          return <div key={item.id} style={dividerStyle} role="separator" />;
        }
        return (
          <button
            key={item.id}
            role="menuitem"
            disabled={item.disabled}
            onClick={() => handleItemClick(item.id, item.disabled)}
            onPointerEnter={item.disabled ? undefined : handlePointerEnter}
            onPointerLeave={item.disabled ? undefined : handlePointerLeave}
            style={{
              ...itemStyle,
              color: item.danger ? COLOR_ERROR : item.disabled ? COLOR_TEXT_DISABLED : COLOR_TEXT,
              cursor: item.disabled ? "default" : "pointer",
              opacity: item.disabled ? 0.5 : 1,
            }}
            data-testid={`context-menu-item-${item.id}`}
          >
            <span style={{ display: "flex", alignItems: "center", gap: SPACE_SM }}>
              {item.icon ? <span style={{ display: "flex" }}>{item.icon}</span> : null}
              {item.label}
            </span>
            {item.shortcut ? <span style={shortcutStyle}>{item.shortcut}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
