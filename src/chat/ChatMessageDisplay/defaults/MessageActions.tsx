/**
 * @file MessageActions - Action buttons rendered below a message
 */

import { memo, useMemo, useState, useCallback } from "react";
import type { CSSProperties } from "react";
import type { MessageAction } from "../types";
import {
  COLOR_TEXT_MUTED,
  COLOR_TEXT,
  COLOR_PRIMARY,
  COLOR_HOVER,
  RADIUS_SM,
  SPACE_XS,
  SPACE_SM,
  SIZE_FONT_XS,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../../themes/styles";

// =============================================================================
// Action Button
// =============================================================================

type ActionButtonProps = {
  action: MessageAction;
};

const buttonBaseStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: SPACE_XS,
  border: "none",
  borderRadius: RADIUS_SM,
  backgroundColor: "transparent",
  color: COLOR_TEXT_MUTED,
  cursor: "pointer",
  transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}, color ${DURATION_FAST} ${EASING_DEFAULT}`,
  fontSize: SIZE_FONT_XS,
};

const ActionButton = memo(function ActionButton({ action }: ActionButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerEnter = useCallback(() => setIsHovered(true), []);
  const handlePointerLeave = useCallback(() => setIsHovered(false), []);

  const style = useMemo<CSSProperties>(() => {
    const base = { ...buttonBaseStyle };

    if (action.disabled) {
      return {
        ...base,
        opacity: 0.4,
        cursor: "not-allowed",
      };
    }

    if (action.active) {
      return {
        ...base,
        color: COLOR_PRIMARY,
        backgroundColor: isHovered ? COLOR_HOVER : "transparent",
      };
    }

    if (isHovered) {
      return {
        ...base,
        color: COLOR_TEXT,
        backgroundColor: COLOR_HOVER,
      };
    }

    return base;
  }, [action.disabled, action.active, isHovered]);

  const handleClick = useCallback(() => {
    if (!action.disabled) {
      action.onClick();
    }
  }, [action]);

  return (
    <button
      type="button"
      style={style}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      disabled={action.disabled}
      title={action.label}
      aria-label={action.label}
      aria-pressed={action.active}
    >
      {action.icon}
    </button>
  );
});

// =============================================================================
// Message Actions Container
// =============================================================================

export type MessageActionsProps = {
  actions: MessageAction[];
  className?: string;
};

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACE_XS,
  marginTop: SPACE_SM,
};

export const MessageActions = memo(function MessageActions({
  actions,
  className,
}: MessageActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <div style={containerStyle} className={className}>
      {actions.map((action) => (
        <ActionButton key={action.id} action={action} />
      ))}
    </div>
  );
});
