/**
 * @file SelectionToolbar component - Selection-based toolbar for inline operations
 *
 * @description
 * A toolbar that appears near selected content (text, shapes, etc.).
 * Editor-agnostic: can be used with TextEditor, Canvas, or any selection-based UI.
 *
 * @example
 * ```tsx
 * import { SelectionToolbar } from "react-editor-ui/SelectionToolbar";
 *
 * <SelectionToolbar
 *   anchor={{ x: 100, y: 50, width: 200, height: 20 }}
 *   operations={[
 *     { id: "bold", label: "Bold", icon: <BoldIcon /> },
 *     { id: "italic", label: "Italic", icon: <ItalicIcon /> },
 *   ]}
 *   onOperationSelect={(id) => console.log("Selected:", id)}
 * />
 * ```
 */

import { memo, useState, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import type { CSSProperties, MouseEvent } from "react";
import type { SelectionToolbarProps } from "./types";
import { useSelectionToolbarPosition } from "./useSelectionToolbarPosition";
import { Portal } from "../Portal/Portal";
import { Toolbar } from "../Toolbar/Toolbar";
import { Tooltip } from "../Tooltip/Tooltip";
import { IconButton } from "../IconButton/IconButton";
import { Z_POPOVER } from "../../constants/styles";

// =============================================================================
// Constants
// =============================================================================

/** Default toolbar dimensions for initial positioning */
const DEFAULT_TOOLBAR_WIDTH = 200;
const DEFAULT_TOOLBAR_HEIGHT = 36;

/** Prevent text deselection on pointer down - defined outside to avoid recreating */
const handlePointerDown = (e: React.PointerEvent) => {
  e.preventDefault();
};

// =============================================================================
// Sub-components
// =============================================================================

type OperationButtonProps = {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly shortcut?: string;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly onSelect: (id: string) => void;
};

const OperationButton = memo(function OperationButton({
  id,
  label,
  icon,
  shortcut,
  active,
  disabled,
  onSelect,
}: OperationButtonProps) {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      // Prevent the click from propagating and potentially deselecting text
      e.preventDefault();
      e.stopPropagation();
      onSelect(id);
    },
    [id, onSelect],
  );

  // Memoize tooltip content to prevent Tooltip re-renders
  const tooltipContent = useMemo(
    () => (shortcut ? `${label} (${shortcut})` : label),
    [label, shortcut],
  );

  // Memoize variant to prevent unnecessary comparisons
  const variant = active ? "selected" : "default";

  return (
    <Tooltip content={tooltipContent} placement="top" delay={400}>
      <IconButton
        icon={icon}
        aria-label={label}
        size="sm"
        variant={variant}
        disabled={disabled}
        onClick={handleClick}
      />
    </Tooltip>
  );
});

// =============================================================================
// Main Component
// =============================================================================

/**
 * Generic floating toolbar for selection-based operations.
 *
 * Features:
 * - Portal-based rendering for overlay behavior
 * - Automatic positioning with viewport clamping
 * - Supports top/bottom placement with auto-flip
 * - Keyboard accessible
 */
export const SelectionToolbar = memo(function SelectionToolbar({
  anchor,
  operations,
  onOperationSelect,
  placement = "top",
  className,
}: SelectionToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: DEFAULT_TOOLBAR_WIDTH,
    height: DEFAULT_TOOLBAR_HEIGHT,
  });

  // Measure actual toolbar dimensions after render
  // Only update if dimensions actually changed to prevent unnecessary re-renders
  useLayoutEffect(() => {
    if (toolbarRef.current) {
      const { offsetWidth, offsetHeight } = toolbarRef.current;
      setDimensions((prev) => {
        if (prev.width === offsetWidth && prev.height === offsetHeight) {
          return prev;
        }
        return { width: offsetWidth, height: offsetHeight };
      });
    }
  }, [operations.length]);

  // Calculate position
  const position = useSelectionToolbarPosition({
    anchor,
    placement,
    toolbarWidth: dimensions.width,
    toolbarHeight: dimensions.height,
  });

  // Container styles
  const containerStyle = useMemo<CSSProperties>(() => ({
    position: "fixed",
    left: position.x,
    top: position.y,
    zIndex: Z_POPOVER,
    // Prevent pointer events from affecting the selection
    userSelect: "none",
  }), [position.x, position.y]);

  if (operations.length === 0) {
    return null;
  }

  return (
    <Portal>
      <div
        ref={toolbarRef}
        style={containerStyle}
        className={className}
        onPointerDown={handlePointerDown}
        role="toolbar"
        aria-label="Selection toolbar"
      >
        <Toolbar variant="selection" orientation="horizontal" fitContent>
          {operations.map((operation) => (
            <OperationButton
              key={operation.id}
              id={operation.id}
              label={operation.label}
              icon={operation.icon}
              shortcut={operation.shortcut}
              active={operation.active}
              disabled={operation.disabled}
              onSelect={onOperationSelect}
            />
          ))}
        </Toolbar>
      </div>
    </Portal>
  );
});

// =============================================================================
// Re-exports
// =============================================================================

export type {
  SelectionToolbarProps,
  SelectionToolbarAnchor,
  SelectionToolbarOperation,
  SelectionToolbarPlacement,
} from "./types";

export {
  useSelectionToolbarPosition,
  calculateSelectionToolbarPosition,
  type SelectionToolbarPosition,
  type UseSelectionToolbarPositionOptions,
} from "./useSelectionToolbarPosition";
