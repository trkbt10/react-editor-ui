/**
 * @file FloatingToolbar component - Generic selection-based toolbar
 *
 * @description
 * A floating toolbar that appears near selected content.
 * Editor-agnostic: can be used with TextEditor, Canvas, or any selection-based UI.
 *
 * @example
 * ```tsx
 * import { FloatingToolbar } from "react-editor-ui/FloatingToolbar";
 *
 * <FloatingToolbar
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
import type { FloatingToolbarProps } from "./types";
import { useFloatingToolbarPosition } from "./useFloatingToolbarPosition";
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

  const tooltipContent = shortcut ? `${label} (${shortcut})` : label;

  return (
    <Tooltip content={tooltipContent} placement="top" delay={400}>
      <IconButton
        icon={icon}
        aria-label={label}
        size="sm"
        variant={active ? "selected" : "default"}
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
export const FloatingToolbar = memo(function FloatingToolbar({
  anchor,
  operations,
  onOperationSelect,
  placement = "top",
  className,
}: FloatingToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: DEFAULT_TOOLBAR_WIDTH,
    height: DEFAULT_TOOLBAR_HEIGHT,
  });

  // Measure actual toolbar dimensions after render
  useLayoutEffect(() => {
    if (toolbarRef.current) {
      const { offsetWidth, offsetHeight } = toolbarRef.current;
      setDimensions({ width: offsetWidth, height: offsetHeight });
    }
  }, [operations.length]);

  // Calculate position
  const position = useFloatingToolbarPosition({
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

  // Handle pointer down to prevent text deselection
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
  }, []);

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
  FloatingToolbarProps,
  FloatingToolbarAnchor,
  FloatingToolbarOperation,
  FloatingToolbarPlacement,
} from "./types";

export {
  useFloatingToolbarPosition,
  calculateFloatingToolbarPosition,
  type FloatingToolbarPosition,
  type UseFloatingToolbarPositionOptions,
} from "./useFloatingToolbarPosition";
