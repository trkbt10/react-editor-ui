/**
 * @file LayerItem component - Layer panel item for hierarchical display
 * Features: visibility toggle, lock toggle, rename, delete, reorder, context menu
 */

import type { ReactNode, CSSProperties, PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent, KeyboardEvent, DragEvent } from "react";
import { memo, useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_DROP_TARGET,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_TEXT_DISABLED,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_ICON_ACTIVE,
  COLOR_PRIMARY,
  SIZE_FONT_SM,
  SIZE_TREE_INDENT,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  DURATION_FAST,
  EASING_DEFAULT,
  RADIUS_SM,
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER_FOCUS,
} from "../../constants/styles";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import type { ContextMenuItem } from "../ContextMenu/ContextMenu";
import { EyeIcon, LockIcon, DragHandleIcon, ChevronRightIcon } from "../../icons";

// ChevronIcon wrapper for expand/collapse with rotation
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
      <ChevronRightIcon size={12} />
    </span>
  );
});

// ========================================
// STATIC STYLES
// ========================================

const expanderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "16px",
  height: "16px",
  marginRight: SPACE_XS,
  color: COLOR_ICON,
  cursor: "pointer",
  flexShrink: 0,
};

const iconStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginRight: SPACE_SM,
  color: COLOR_ICON,
  flexShrink: 0,
};

const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  color: COLOR_TEXT,
  fontSize: SIZE_FONT_SM,
  backgroundColor: COLOR_INPUT_BG,
  border: `1px solid ${COLOR_INPUT_BORDER_FOCUS}`,
  borderRadius: RADIUS_SM,
  padding: `${SPACE_XS} ${SPACE_SM}`,
  outline: "none",
  margin: `-${SPACE_XS} 0`,
};

const actionButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "20px",
  height: "20px",
  padding: 0,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: COLOR_ICON,
  borderRadius: RADIUS_SM,
  transition: `color ${DURATION_FAST} ${EASING_DEFAULT}, background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
  flexShrink: 0,
  marginLeft: SPACE_XS,
};

const activeActionStyle: CSSProperties = {
  ...actionButtonStyle,
  color: COLOR_ICON_ACTIVE,
};

const hiddenActionStyle: CSSProperties = {
  ...actionButtonStyle,
  color: COLOR_TEXT_DISABLED,
};

const badgeStyle: CSSProperties = {
  marginLeft: SPACE_SM,
  flexShrink: 0,
};

const expanderPlaceholderStyle: CSSProperties = {
  width: "16px",
  marginRight: SPACE_XS,
  flexShrink: 0,
};

// ========================================
// TYPES
// ========================================

/** Alias for ContextMenuItem for use with LayerItem context menus */
export type LayerContextMenuItem = ContextMenuItem;

/** Drop position indicator for drag and drop */
export type DropPosition = "before" | "inside" | "after" | null;

export type LayerItemProps = {
  /** Unique identifier for the layer */
  id: string;
  /** Display label */
  label: string;
  /** Icon representing layer type (Frame, Text, Image, etc.) */
  icon?: ReactNode;
  /** Nesting depth for indentation */
  depth?: number;
  /** Has child layers */
  hasChildren?: boolean;
  /** Children are expanded/visible */
  expanded?: boolean;
  /** Toggle expand/collapse */
  onToggle?: () => void;
  /** Layer is selected */
  selected?: boolean;
  /** Pointer down handler for selection (receives PointerEvent for modifier key detection) */
  onPointerDown?: (e: ReactPointerEvent) => void;
  /** Double-click handler */
  onDoubleClick?: () => void;
  /** Layer is visible */
  visible?: boolean;
  /** Toggle visibility */
  onVisibilityChange?: (visible: boolean) => void;
  /** Layer is locked */
  locked?: boolean;
  /** Toggle lock */
  onLockChange?: (locked: boolean) => void;
  /** Enable inline rename */
  renamable?: boolean;
  /** Rename handler */
  onRename?: (newLabel: string) => void;
  /** Enable delete */
  deletable?: boolean;
  /** Delete handler */
  onDelete?: () => void;
  /** Enable drag reordering */
  draggable?: boolean;
  /** Drag start handler */
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  /** Drag handler */
  onDrag?: (e: DragEvent<HTMLDivElement>) => void;
  /** Drag over handler */
  onDragOver?: (e: DragEvent<HTMLDivElement>) => void;
  /** Drag enter handler */
  onDragEnter?: (e: DragEvent<HTMLDivElement>) => void;
  /** Drag leave handler */
  onDragLeave?: (e: DragEvent<HTMLDivElement>) => void;
  /** Drag end handler */
  onDragEnd?: (e: DragEvent<HTMLDivElement>) => void;
  /** Drop handler */
  onDrop?: (e: DragEvent<HTMLDivElement>) => void;
  /** Context menu items */
  contextMenuItems?: ContextMenuItem[];
  /** Context menu handler */
  onContextMenu?: (itemId: string) => void;
  /** Additional class name */
  className?: string;
  /** Badge content (e.g., component indicator) */
  badge?: ReactNode;
  /** Layer is dimmed (e.g., hidden parent) */
  dimmed?: boolean;
  /** Show visibility toggle */
  showVisibilityToggle?: boolean;
  /** Show lock toggle */
  showLockToggle?: boolean;
  /** Show drag handle */
  showDragHandle?: boolean;
  /** Current drop position indicator */
  dropPosition?: DropPosition;
  /** Whether this layer can accept children (for drop inside) */
  canHaveChildren?: boolean;
};

// ========================================
// COMPONENT
// ========================================

/** Layer panel item row with expand/collapse, visibility, lock, and drag handle */
export const LayerItem = memo(function LayerItem({
  id,
  label,
  icon,
  depth = 0,
  hasChildren = false,
  expanded = false,
  onToggle,
  selected = false,
  onPointerDown,
  onDoubleClick,
  visible = true,
  onVisibilityChange,
  locked = false,
  onLockChange,
  renamable = false,
  onRename,
  draggable = false,
  onDragStart,
  onDrag,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDragEnd,
  onDrop,
  contextMenuItems,
  onContextMenu,
  className,
  badge,
  dimmed = false,
  showVisibilityToggle = true,
  showLockToggle = true,
  showDragHandle = false,
  dropPosition = null,
}: LayerItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(label);
  const [isHovered, setIsHovered] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    if (renamable && !locked) {
      setIsEditing(true);
      setEditValue(label);
    }
  }, [renamable, locked, label]);

  const handleFinishEdit = useCallback(() => {
    setIsEditing(false);
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== label) {
      onRename?.(trimmedValue);
    }
    setEditValue(label);
  }, [editValue, label, onRename]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleFinishEdit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(label);
    }
  }, [handleFinishEdit, label]);

  const handleContextMenuEvent = useCallback((e: ReactMouseEvent) => {
    if (contextMenuItems && contextMenuItems.length > 0) {
      e.preventDefault();
      setContextMenuPos({ x: e.clientX, y: e.clientY });
    }
  }, [contextMenuItems]);

  const handleContextMenuClose = useCallback(() => {
    setContextMenuPos(null);
  }, []);

  const handleContextMenuSelect = useCallback((itemId: string) => {
    onContextMenu?.(itemId);
  }, [onContextMenu]);

  const handleDoubleClickEvent = useCallback((e: ReactPointerEvent) => {
    e.stopPropagation();
    if (renamable && !locked) {
      handleStartEdit();
    } else {
      onDoubleClick?.();
    }
  }, [renamable, locked, handleStartEdit, onDoubleClick]);

  // Memoized styles
  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      padding: `${SPACE_XS} ${SPACE_MD}`,
      paddingLeft: `calc(${SPACE_MD} + ${SIZE_TREE_INDENT} * ${depth})`,
      backgroundColor: dropPosition === "inside" ? COLOR_DROP_TARGET : selected ? COLOR_SELECTED : "transparent",
      cursor: locked ? "default" : "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      userSelect: "none",
      opacity: dimmed || !visible ? 0.5 : 1,
      position: "relative",
      minHeight: "28px",
      outline: dropPosition === "inside" ? `2px solid ${COLOR_PRIMARY}` : "none",
      outlineOffset: "-2px",
    }),
    [depth, dropPosition, selected, locked, dimmed, visible],
  );

  const dropIndicatorBeforeStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      left: `calc(${SPACE_MD} + ${SIZE_TREE_INDENT} * ${depth})`,
      right: SPACE_MD,
      height: "2px",
      backgroundColor: COLOR_PRIMARY,
      pointerEvents: "none",
      top: 0,
    }),
    [depth],
  );

  const dropIndicatorAfterStyle = useMemo<CSSProperties>(
    () => ({
      position: "absolute",
      left: `calc(${SPACE_MD} + ${SIZE_TREE_INDENT} * ${depth})`,
      right: SPACE_MD,
      height: "2px",
      backgroundColor: COLOR_PRIMARY,
      pointerEvents: "none",
      bottom: 0,
    }),
    [depth],
  );

  const dragHandleStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "14px",
      height: "14px",
      marginRight: SPACE_XS,
      color: COLOR_ICON,
      cursor: draggable ? "grab" : "default",
      opacity: isHovered && draggable ? 1 : 0,
      transition: `opacity ${DURATION_FAST} ${EASING_DEFAULT}`,
      flexShrink: 0,
    }),
    [draggable, isHovered],
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

  // Memoized handlers
  const handlePointerEnter = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    setIsHovered(true);
    if (!selected && dropPosition !== "inside") {
      e.currentTarget.style.backgroundColor = COLOR_HOVER;
    }
  }, [selected, dropPosition]);

  const handlePointerLeave = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    setIsHovered(false);
    if (!selected && dropPosition !== "inside") {
      e.currentTarget.style.backgroundColor = "transparent";
    }
  }, [selected, dropPosition]);

  const handlePointerDownEvent = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    // Don't trigger selection when clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }
    onPointerDown?.(e);
  }, [onPointerDown]);

  const handleExpanderClick = useCallback((e: ReactPointerEvent<HTMLSpanElement>) => {
    e.stopPropagation();
    onToggle?.();
  }, [onToggle]);

  const handleVisibilityClick = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onVisibilityChange?.(!visible);
  }, [onVisibilityChange, visible]);

  const handleLockClick = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onLockChange?.(!locked);
  }, [onLockChange, locked]);

  const handleActionHoverEnter = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = COLOR_HOVER;
    e.currentTarget.style.color = COLOR_ICON_HOVER;
  }, []);

  const handleVisibilityHoverLeave = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = visible ? COLOR_ICON : COLOR_TEXT_DISABLED;
  }, [visible]);

  const handleLockHoverLeave = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = locked ? COLOR_ICON_ACTIVE : COLOR_ICON;
  }, [locked]);

  const handleButtonPointerDown = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  }, []);

  const handleInputPointerDown = useCallback((e: ReactPointerEvent<HTMLInputElement>) => {
    e.stopPropagation();
  }, []);

  const handleExpanderHoverEnter = useCallback((e: ReactPointerEvent<HTMLSpanElement>) => {
    e.currentTarget.style.color = COLOR_ICON_HOVER;
  }, []);

  const handleExpanderHoverLeave = useCallback((e: ReactPointerEvent<HTMLSpanElement>) => {
    e.currentTarget.style.color = COLOR_ICON;
  }, []);

  // Render expander
  const renderExpander = () => {
    if (!hasChildren) {
      return <span style={expanderPlaceholderStyle} />;
    }
    return (
      <span
        role="button"
        aria-label={expanded ? "Collapse" : "Expand"}
        onClick={handleExpanderClick}
        onPointerEnter={handleExpanderHoverEnter}
        onPointerLeave={handleExpanderHoverLeave}
        style={expanderStyle}
      >
        <ChevronIcon expanded={expanded} />
      </span>
    );
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  }, []);

  // Render label or edit input
  const renderLabel = () => {
    if (isEditing) {
      return (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={handleInputChange}
          onBlur={handleFinishEdit}
          onKeyDown={handleKeyDown}
          onPointerDown={handleInputPointerDown}
          style={inputStyle}
          aria-label="Layer name"
          data-testid="layer-name-input"
        />
      );
    }
    return (
      <span style={labelStyle} data-testid="layer-label">{label}</span>
    );
  };

  // Track double-click with pointer events
  const lastPointerDownTime = useRef(0);
  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastPointerDownTime.current < 300) {
      handleDoubleClickEvent(e);
    }
    lastPointerDownTime.current = now;
  };

  return (
    <>
      <div
        ref={containerRef}
        role="treeitem"
        aria-selected={selected}
        aria-expanded={hasChildren ? expanded : undefined}
        onPointerDown={handlePointerDownEvent}
        onPointerUp={handlePointerUp}
        onContextMenu={handleContextMenuEvent}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        draggable={draggable && !isEditing}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragEnd={onDragEnd}
        onDrop={onDrop}
        className={className}
        style={containerStyle}
        data-layer-id={id}
        data-testid={`layer-item-${id}`}
      >
        {/* Drop Indicators */}
        {dropPosition === "before" && <div style={dropIndicatorBeforeStyle} data-testid="drop-indicator-before" />}
        {dropPosition === "after" && <div style={dropIndicatorAfterStyle} data-testid="drop-indicator-after" />}

        {/* Drag Handle */}
        {showDragHandle && (
          <span style={dragHandleStyle} data-testid="drag-handle">
            <DragHandleIcon size={10} />
          </span>
        )}

        {/* Expander */}
        {renderExpander()}

        {/* Icon */}
        {icon ? <span style={iconStyle}>{icon}</span> : null}

        {/* Label or Input */}
        {renderLabel()}

        {/* Badge */}
        {badge ? <span style={badgeStyle}>{badge}</span> : null}

        {/* Action Buttons (visible on hover or when active) */}
        {(isHovered || !visible || locked) && !isEditing && (
          <>
            {/* Visibility Toggle */}
            {showVisibilityToggle && onVisibilityChange && (
              <button
                type="button"
                data-action="visibility"
                aria-label={visible ? "Hide layer" : "Show layer"}
                onPointerDown={handleButtonPointerDown}
                onPointerUp={handleVisibilityClick}
                onPointerEnter={handleActionHoverEnter}
                onPointerLeave={handleVisibilityHoverLeave}
                style={visible ? actionButtonStyle : hiddenActionStyle}
                data-testid="visibility-toggle"
              >
                <EyeIcon visible={visible} size={14} />
              </button>
            )}

            {/* Lock Toggle */}
            {showLockToggle && onLockChange && (
              <button
                type="button"
                data-action="lock"
                aria-label={locked ? "Unlock layer" : "Lock layer"}
                onPointerDown={handleButtonPointerDown}
                onPointerUp={handleLockClick}
                onPointerEnter={handleActionHoverEnter}
                onPointerLeave={handleLockHoverLeave}
                style={locked ? activeActionStyle : actionButtonStyle}
                data-testid="lock-toggle"
              >
                <LockIcon locked={locked} size={14} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenuPos && contextMenuItems && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenuPos}
          onSelect={handleContextMenuSelect}
          onClose={handleContextMenuClose}
        />
      )}
    </>
  );
}, (prev, next) =>
  prev.id === next.id &&
  prev.label === next.label &&
  prev.depth === next.depth &&
  prev.hasChildren === next.hasChildren &&
  prev.expanded === next.expanded &&
  prev.selected === next.selected &&
  prev.visible === next.visible &&
  prev.locked === next.locked &&
  prev.dimmed === next.dimmed &&
  prev.dropPosition === next.dropPosition &&
  prev.draggable === next.draggable &&
  prev.canHaveChildren === next.canHaveChildren &&
  prev.showVisibilityToggle === next.showVisibilityToggle &&
  prev.showLockToggle === next.showLockToggle &&
  prev.showDragHandle === next.showDragHandle &&
  prev.renamable === next.renamable &&
  prev.deletable === next.deletable &&
  prev.icon === next.icon &&
  prev.badge === next.badge &&
  prev.className === next.className &&
  prev.onToggle === next.onToggle &&
  prev.onPointerDown === next.onPointerDown &&
  prev.onDoubleClick === next.onDoubleClick &&
  prev.onVisibilityChange === next.onVisibilityChange &&
  prev.onLockChange === next.onLockChange &&
  prev.onRename === next.onRename &&
  prev.onDelete === next.onDelete &&
  prev.onContextMenu === next.onContextMenu &&
  prev.onDragStart === next.onDragStart &&
  prev.onDrag === next.onDrag &&
  prev.onDragOver === next.onDragOver &&
  prev.onDragEnter === next.onDragEnter &&
  prev.onDragLeave === next.onDragLeave &&
  prev.onDragEnd === next.onDragEnd &&
  prev.onDrop === next.onDrop
  // Note: contextMenuItems is intentionally excluded to avoid re-renders
  // when only the menu content changes. The menu reads items when opened.
);
