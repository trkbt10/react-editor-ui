/**
 * @file ContextBadge component - Removable context badge for chat input
 *
 * @description
 * A badge component for displaying context references (files, tabs, selections)
 * in chat input. Supports icons, labels, type indicators, and removal.
 *
 * @example
 * ```tsx
 * import { ContextBadge } from "react-editor-ui/chat/ChatInput";
 *
 * <ContextBadge
 *   icon={<FileIcon />}
 *   label="Document.tsx"
 *   type="File"
 *   onRemove={() => handleRemove(id)}
 * />
 * ```
 */

import { memo, useState, useMemo, useCallback } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_SURFACE_RAISED,
  COLOR_HOVER,
  RADIUS_MD,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";

// =============================================================================
// Types
// =============================================================================

export type ContextBadgeProps = {
  /** Icon to display at the start */
  icon?: ReactNode;
  /** Main label text */
  label: string;
  /** Type indicator (e.g., "Tab", "File", "Selection") */
  type?: string;
  /** Called when the remove button is clicked */
  onRemove?: () => void;
  /** Custom class name */
  className?: string;
};

// =============================================================================
// Icons
// =============================================================================

const CloseIcon = memo(function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
});

// =============================================================================
// Component
// =============================================================================

/**
 * Context badge for displaying removable context references.
 */
export const ContextBadge = memo(function ContextBadge({
  icon,
  label,
  type,
  onRemove,
  className,
}: ContextBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isCloseHovered, setIsCloseHovered] = useState(false);

  const containerStyle = useMemo<CSSProperties>(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      gap: SPACE_SM,
      paddingTop: SPACE_SM,
      paddingRight: SPACE_MD,
      paddingBottom: SPACE_SM,
      paddingLeft: SPACE_MD,
      backgroundColor: isHovered ? COLOR_HOVER : COLOR_SURFACE_RAISED,
      border: `1px dashed ${COLOR_BORDER}`,
      borderRadius: RADIUS_MD,
      fontSize: SIZE_FONT_SM,
      color: COLOR_TEXT,
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
      cursor: "default",
      userSelect: "none",
      maxWidth: "100%",
    }),
    [isHovered],
  );

  const iconStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),
    [],
  );

  const labelStyle = useMemo<CSSProperties>(
    () => ({
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }),
    [],
  );

  const typeStyle = useMemo<CSSProperties>(
    () => ({
      color: COLOR_TEXT_MUTED,
      flexShrink: 0,
    }),
    [],
  );

  const closeButtonStyle = useMemo<CSSProperties>(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      padding: 0,
      border: "none",
      backgroundColor: isCloseHovered ? COLOR_HOVER : "transparent",
      borderRadius: "50%",
      color: COLOR_TEXT_MUTED,
      cursor: "pointer",
      flexShrink: 0,
      transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
    }),
    [isCloseHovered],
  );

  const handlers = useMemo(
    () => ({
      onPointerEnter: () => setIsHovered(true),
      onPointerLeave: () => setIsHovered(false),
    }),
    [],
  );

  const closeHandlers = useMemo(
    () => ({
      onPointerEnter: () => setIsCloseHovered(true),
      onPointerLeave: () => setIsCloseHovered(false),
    }),
    [],
  );

  const handleRemoveClick = useCallback(() => {
    onRemove?.();
  }, [onRemove]);

  return (
    <div
      className={className}
      style={containerStyle}
      onPointerEnter={handlers.onPointerEnter}
      onPointerLeave={handlers.onPointerLeave}
    >
      {icon && <span style={iconStyle}>{icon}</span>}
      <span style={labelStyle}>{label}</span>
      {type && <span style={typeStyle}>{type}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemoveClick}
          onPointerEnter={closeHandlers.onPointerEnter}
          onPointerLeave={closeHandlers.onPointerLeave}
          style={closeButtonStyle}
          aria-label={`Remove ${label}`}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
});
