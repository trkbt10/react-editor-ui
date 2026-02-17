/**
 * @file LayerLabel - Label display and inline edit for layer items
 */

import type { CSSProperties, KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { memo, useRef, useEffect, useCallback, useMemo } from "react";
import {
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  SIZE_FONT_SM,
  SPACE_XS,
  SPACE_SM,
  RADIUS_SM,
  COLOR_INPUT_BG,
  COLOR_INPUT_BORDER_FOCUS,
} from "../../themes/styles";

// ========================================
// STATIC STYLES
// ========================================

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

// ========================================
// LAYER LABEL
// ========================================

export type LayerLabelProps = {
  /** Display label */
  label: string;
  /** Whether item is selected (affects text color) */
  selected: boolean;
  /** Whether currently in edit mode (controlled by parent) */
  isEditing: boolean;
  /** Current edit value (controlled by parent) */
  editValue: string;
  /** Edit value change handler */
  onEditValueChange: (value: string) => void;
  /** Finish editing handler */
  onFinishEdit: () => void;
  /** Cancel editing handler */
  onCancelEdit: () => void;
};

/**
 * Label component with inline edit support.
 * Editing state is controlled by parent for testability.
 */
export const LayerLabel = memo(function LayerLabel({
  label,
  selected,
  isEditing,
  editValue,
  onEditValueChange,
  onFinishEdit,
  onCancelEdit,
}: LayerLabelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onFinishEdit();
      } else if (e.key === "Escape") {
        onCancelEdit();
      }
    },
    [onFinishEdit, onCancelEdit],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onEditValueChange(e.target.value);
    },
    [onEditValueChange],
  );

  const handleInputPointerDown = useCallback((e: ReactPointerEvent<HTMLInputElement>) => {
    e.stopPropagation();
  }, []);

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

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={handleInputChange}
        onBlur={onFinishEdit}
        onKeyDown={handleKeyDown}
        onPointerDown={handleInputPointerDown}
        style={inputStyle}
        aria-label="Layer name"
        data-testid="layer-name-input"
      />
    );
  }

  return (
    <span style={labelStyle} data-testid="layer-label">
      {label}
    </span>
  );
});
