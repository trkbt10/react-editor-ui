/**
 * @file LayerItem component - Layer panel item for hierarchical display
 * Features: visibility toggle, lock toggle, rename, delete, reorder, context menu
 */

import type {
  ReactNode,
  CSSProperties,
  PointerEvent as ReactPointerEvent,
  MouseEvent as ReactMouseEvent,
  DragEvent,
} from "react";
import { memo, useState, useRef, useCallback, useMemo } from "react";
import {
  COLOR_HOVER,
  COLOR_SELECTED,
  COLOR_DROP_TARGET,
  COLOR_ICON,
  COLOR_PRIMARY,
  SIZE_TREE_INDENT,
  SIZE_LAYER_ITEM_HEIGHT,
  SIZE_DRAG_HANDLE,
  SPACE_XS,
  SPACE_SM,
  SPACE_MD,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";
import { ContextMenu } from "../ContextMenu/ContextMenu";
import type { ContextMenuItem } from "../ContextMenu/ContextMenu";
import { DragHandleIcon } from "../../icons";
import { LayerExpander } from "./LayerExpander";
import { LayerLabel } from "./LayerLabel";
import { LayerActionButtons } from "./LayerActionButtons";

// ========================================
// STATIC STYLES
// ========================================

const iconStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginRight: SPACE_SM,
  color: COLOR_ICON,
  flexShrink: 0,
};

const badgeStyle: CSSProperties = {
  marginLeft: SPACE_SM,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPointerDownTime = useRef(0);

  // ========================================
  // EDIT HANDLERS
  // ========================================

  const editHandlers = useMemo(
    () => ({
      start: () => {
        if (renamable && !locked) {
          setIsEditing(true);
          setEditValue(label);
        }
      },
      finish: () => {
        setIsEditing(false);
        const trimmedValue = editValue.trim();
        if (trimmedValue && trimmedValue !== label) {
          onRename?.(trimmedValue);
        }
        setEditValue(label);
      },
      cancel: () => {
        setIsEditing(false);
        setEditValue(label);
      },
      change: (value: string) => {
        setEditValue(value);
      },
    }),
    [renamable, locked, label, editValue, onRename],
  );

  // ========================================
  // MEMOIZED STYLES
  // ========================================

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      padding: `${SPACE_XS} ${SPACE_MD}`,
      paddingLeft: `calc(${SPACE_MD} + ${SIZE_TREE_INDENT} * ${depth})`,
      backgroundColor:
        dropPosition === "inside" ? COLOR_DROP_TARGET : selected ? COLOR_SELECTED : "transparent",
      cursor: locked ? "default" : "pointer",
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      userSelect: "none",
      opacity: dimmed || !visible ? 0.5 : 1,
      position: "relative",
      minHeight: SIZE_LAYER_ITEM_HEIGHT,
      outline: dropPosition === "inside" ? `${SPACE_XS} solid ${COLOR_PRIMARY}` : "none",
      outlineOffset: `calc(-1 * ${SPACE_XS})`,
    }),
    [depth, dropPosition, selected, locked, dimmed, visible],
  );

  const dropIndicatorStyles = useMemo(
    () => ({
      before: {
        position: "absolute",
        left: `calc(${SPACE_MD} + ${SIZE_TREE_INDENT} * ${depth})`,
        right: SPACE_MD,
        height: SPACE_XS,
        backgroundColor: COLOR_PRIMARY,
        pointerEvents: "none",
        top: 0,
      } as CSSProperties,
      after: {
        position: "absolute",
        left: `calc(${SPACE_MD} + ${SIZE_TREE_INDENT} * ${depth})`,
        right: SPACE_MD,
        height: SPACE_XS,
        backgroundColor: COLOR_PRIMARY,
        pointerEvents: "none",
        bottom: 0,
      } as CSSProperties,
    }),
    [depth],
  );

  const dragHandleStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: SIZE_DRAG_HANDLE,
      height: SIZE_DRAG_HANDLE,
      marginRight: SPACE_XS,
      color: COLOR_ICON,
      cursor: draggable ? "grab" : "default",
      opacity: isHovered && draggable ? 1 : 0,
      transition: `opacity ${DURATION_FAST} ${EASING_DEFAULT}`,
      flexShrink: 0,
    }),
    [draggable, isHovered],
  );

  // ========================================
  // CONTAINER HANDLERS
  // ========================================

  const handlePointerEnter = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      setIsHovered(true);
      if (!selected && dropPosition !== "inside") {
        e.currentTarget.style.backgroundColor = COLOR_HOVER;
      }
    },
    [selected, dropPosition],
  );

  const handlePointerLeave = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      setIsHovered(false);
      if (!selected && dropPosition !== "inside") {
        e.currentTarget.style.backgroundColor = "transparent";
      }
    },
    [selected, dropPosition],
  );

  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // Don't trigger selection when clicking on action buttons
      const target = e.target as HTMLElement;
      if (target.closest("button")) {
        return;
      }
      onPointerDown?.(e);
    },
    [onPointerDown],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      const now = Date.now();
      if (now - lastPointerDownTime.current < 300) {
        // Double-tap detected
        e.stopPropagation();
        if (renamable && !locked) {
          editHandlers.start();
        } else {
          onDoubleClick?.();
        }
      }
      lastPointerDownTime.current = now;
    },
    [renamable, locked, editHandlers, onDoubleClick],
  );

  const handleContextMenuEvent = useCallback(
    (e: ReactMouseEvent) => {
      if (contextMenuItems && contextMenuItems.length > 0) {
        e.preventDefault();
        setContextMenuPos({ x: e.clientX, y: e.clientY });
      }
    },
    [contextMenuItems],
  );

  const contextMenuHandlers = useMemo(
    () => ({
      close: () => setContextMenuPos(null),
      select: (itemId: string) => onContextMenu?.(itemId),
    }),
    [onContextMenu],
  );

  // Determine if action buttons should be visible
  const showActionButtons = (isHovered || !visible || locked) && !isEditing;

  return (
    <>
      <div
        ref={containerRef}
        role="treeitem"
        aria-selected={selected}
        aria-expanded={hasChildren ? expanded : undefined}
        onPointerDown={handlePointerDown}
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
        {dropPosition === "before" && (
          <div style={dropIndicatorStyles.before} data-testid="drop-indicator-before" />
        )}
        {dropPosition === "after" && (
          <div style={dropIndicatorStyles.after} data-testid="drop-indicator-after" />
        )}

        {/* Drag Handle */}
        {showDragHandle && (
          <span style={dragHandleStyle} data-testid="drag-handle">
            <DragHandleIcon size={10} />
          </span>
        )}

        {/* Expander */}
        <LayerExpander hasChildren={hasChildren} expanded={expanded} onToggle={onToggle} />

        {/* Icon */}
        {icon ? <span style={iconStyle}>{icon}</span> : null}

        {/* Label */}
        <LayerLabel
          label={label}
          selected={selected}
          isEditing={isEditing}
          editValue={editValue}
          onEditValueChange={editHandlers.change}
          onFinishEdit={editHandlers.finish}
          onCancelEdit={editHandlers.cancel}
        />

        {/* Badge */}
        {badge ? <span style={badgeStyle}>{badge}</span> : null}

        {/* Action Buttons (visible on hover or when active) */}
        {showActionButtons && (
          <LayerActionButtons
            showVisibilityToggle={showVisibilityToggle}
            visible={visible}
            onVisibilityChange={onVisibilityChange}
            showLockToggle={showLockToggle}
            locked={locked}
            onLockChange={onLockChange}
          />
        )}
      </div>

      {/* Context Menu */}
      {contextMenuPos && contextMenuItems && (
        <ContextMenu
          items={contextMenuItems}
          position={contextMenuPos}
          onSelect={contextMenuHandlers.select}
          onClose={contextMenuHandlers.close}
        />
      )}
    </>
  );
}, arePropsEqual);

function arePropsEqual(prev: LayerItemProps, next: LayerItemProps): boolean {
  return (
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
  );
  // Note: contextMenuItems is intentionally excluded to avoid re-renders
  // when only the menu content changes. The menu reads items when opened.
}
