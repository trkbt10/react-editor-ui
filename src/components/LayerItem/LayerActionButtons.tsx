/**
 * @file LayerActionButtons - Visibility and lock toggle buttons for layer items
 */

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { memo, useMemo, useCallback } from "react";
import {
  COLOR_HOVER,
  COLOR_ICON,
  COLOR_ICON_HOVER,
  COLOR_ICON_ACTIVE,
  COLOR_TEXT_DISABLED,
  SIZE_ACTION_BUTTON,
  SPACE_XS,
  DURATION_FAST,
  EASING_DEFAULT,
  RADIUS_SM,
} from "../../themes/styles";
import { baseTokens } from "../../themes/tokens";

// Icon size as number (icons require numeric size)
const ICON_SIZE = parseInt(baseTokens["size-icon-md"], 10);
import { EyeIcon, LockIcon } from "../../icons";

// ========================================
// STATIC STYLES
// ========================================

const actionButtonStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: SIZE_ACTION_BUTTON,
  height: SIZE_ACTION_BUTTON,
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

// ========================================
// VISIBILITY TOGGLE
// ========================================

type VisibilityToggleProps = {
  visible: boolean;
  onChange: (visible: boolean) => void;
};

const VisibilityToggle = memo(function VisibilityToggle({
  visible,
  onChange,
}: VisibilityToggleProps) {
  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  }, []);

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onChange(!visible);
    },
    [onChange, visible],
  );

  const hoverHandlers = useMemo(
    () => ({
      enter: (e: ReactPointerEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = COLOR_HOVER;
        e.currentTarget.style.color = COLOR_ICON_HOVER;
      },
      leave: (e: ReactPointerEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = visible ? COLOR_ICON : COLOR_TEXT_DISABLED;
      },
    }),
    [visible],
  );

  return (
    <button
      type="button"
      data-action="visibility"
      aria-label={visible ? "Hide layer" : "Show layer"}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={hoverHandlers.enter}
      onPointerLeave={hoverHandlers.leave}
      style={visible ? actionButtonStyle : hiddenActionStyle}
      data-testid="visibility-toggle"
    >
      <EyeIcon visible={visible} size={ICON_SIZE} />
    </button>
  );
});

// ========================================
// LOCK TOGGLE
// ========================================

type LockToggleProps = {
  locked: boolean;
  onChange: (locked: boolean) => void;
};

const LockToggle = memo(function LockToggle({ locked, onChange }: LockToggleProps) {
  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  }, []);

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onChange(!locked);
    },
    [onChange, locked],
  );

  const hoverHandlers = useMemo(
    () => ({
      enter: (e: ReactPointerEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = COLOR_HOVER;
        e.currentTarget.style.color = COLOR_ICON_HOVER;
      },
      leave: (e: ReactPointerEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = "transparent";
        e.currentTarget.style.color = locked ? COLOR_ICON_ACTIVE : COLOR_ICON;
      },
    }),
    [locked],
  );

  return (
    <button
      type="button"
      data-action="lock"
      aria-label={locked ? "Unlock layer" : "Lock layer"}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerEnter={hoverHandlers.enter}
      onPointerLeave={hoverHandlers.leave}
      style={locked ? activeActionStyle : actionButtonStyle}
      data-testid="lock-toggle"
    >
      <LockIcon locked={locked} size={ICON_SIZE} />
    </button>
  );
});

// ========================================
// LAYER ACTION BUTTONS
// ========================================

export type LayerActionButtonsProps = {
  /** Show visibility toggle */
  showVisibilityToggle: boolean;
  /** Current visibility state */
  visible: boolean;
  /** Visibility change handler */
  onVisibilityChange?: (visible: boolean) => void;
  /** Show lock toggle */
  showLockToggle: boolean;
  /** Current lock state */
  locked: boolean;
  /** Lock change handler */
  onLockChange?: (locked: boolean) => void;
};

/**
 * Action buttons group for layer items (visibility + lock toggles).
 * Only renders when handlers are provided.
 */
export const LayerActionButtons = memo(function LayerActionButtons({
  showVisibilityToggle,
  visible,
  onVisibilityChange,
  showLockToggle,
  locked,
  onLockChange,
}: LayerActionButtonsProps) {
  const showVisibility = showVisibilityToggle && onVisibilityChange;
  const showLock = showLockToggle && onLockChange;

  if (!showVisibility && !showLock) {
    return null;
  }

  return (
    <>
      {showVisibility && (
        <VisibilityToggle visible={visible} onChange={onVisibilityChange} />
      )}
      {showLock && <LockToggle locked={locked} onChange={onLockChange} />}
    </>
  );
});
