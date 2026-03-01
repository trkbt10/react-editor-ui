/**
 * @file Pagination component - Page navigation controls
 *
 * @description
 * A reusable pagination component with First/Prev/Next/Last buttons.
 * Supports controlled pagination with 0-indexed page numbers.
 *
 * @example
 * ```tsx
 * import { Pagination } from "react-editor-ui/Pagination";
 *
 * <Pagination
 *   currentPage={page}
 *   totalPages={totalPages}
 *   onPageChange={setPage}
 * />
 * ```
 */

import type { CSSProperties, PointerEvent } from "react";
import { memo, useCallback, useMemo } from "react";
import type { PaginationProps, PaginationSize } from "./types";
import {
  COLOR_SURFACE,
  COLOR_BORDER,
  COLOR_TEXT,
  COLOR_TEXT_MUTED,
  COLOR_HOVER,
  RADIUS_MD,
  SPACE_SM,
  SPACE_MD,
  SIZE_FONT_SM,
  SIZE_FONT_XS,
  SIZE_HEIGHT_SM,
  SIZE_HEIGHT_MD,
  DURATION_FAST,
  EASING_DEFAULT,
} from "../../themes/styles";

// ============================================================================
// Size map
// ============================================================================

const sizeMap: Record<
  PaginationSize,
  { height: string; fontSize: string; paddingX: string; gap: string }
> = {
  sm: {
    height: SIZE_HEIGHT_SM,
    fontSize: SIZE_FONT_XS,
    paddingX: SPACE_SM,
    gap: SPACE_SM,
  },
  md: {
    height: SIZE_HEIGHT_MD,
    fontSize: SIZE_FONT_SM,
    paddingX: SPACE_MD,
    gap: SPACE_MD,
  },
};

// ============================================================================
// Styles
// ============================================================================

const createContainerStyle = (gap: string): CSSProperties => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap,
  padding: SPACE_SM,
});

const createButtonStyle = (
  height: string,
  fontSize: string,
  paddingX: string
): CSSProperties => ({
  height,
  padding: `0 ${paddingX}`,
  fontSize,
  border: `1px solid ${COLOR_BORDER}`,
  borderRadius: RADIUS_MD,
  backgroundColor: COLOR_SURFACE,
  color: COLOR_TEXT,
  cursor: "pointer",
  transition: `background-color ${DURATION_FAST} ${EASING_DEFAULT}`,
});

const createDisabledButtonStyle = (
  height: string,
  fontSize: string,
  paddingX: string
): CSSProperties => ({
  ...createButtonStyle(height, fontSize, paddingX),
  opacity: 0.5,
  cursor: "not-allowed",
});

const createPageInfoStyle = (fontSize: string): CSSProperties => ({
  fontSize,
  color: COLOR_TEXT_MUTED,
  minWidth: "80px",
  textAlign: "center",
});

// ============================================================================
// PaginationButton
// ============================================================================

type PaginationButtonProps = {
  label: string;
  disabled: boolean;
  onClick: () => void;
  size: PaginationSize;
};

const PaginationButton = memo(function PaginationButton({
  label,
  disabled,
  onClick,
  size,
}: PaginationButtonProps) {
  const { height, fontSize, paddingX } = sizeMap[size];

  const style = disabled
    ? createDisabledButtonStyle(height, fontSize, paddingX)
    : createButtonStyle(height, fontSize, paddingX);

  const handlePointerEnter = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      if (!disabled) {
        e.currentTarget.style.backgroundColor = COLOR_HOVER;
      }
    },
    [disabled]
  );

  const handlePointerLeave = useCallback(
    (e: PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.style.backgroundColor = COLOR_SURFACE;
    },
    []
  );

  return (
    <button
      type="button"
      style={style}
      onClick={onClick}
      disabled={disabled}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {label}
    </button>
  );
});

// ============================================================================
// Pagination
// ============================================================================

/**
 * Pagination controls with First/Prev/Next/Last buttons.
 */
export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  size = "sm",
  showFirstLast = true,
  disabled = false,
  className,
}: PaginationProps) {
  const { gap, fontSize } = sizeMap[size];

  const containerStyle = useMemo(
    () => createContainerStyle(gap),
    [gap]
  );

  const pageInfoStyle = useMemo(
    () => createPageInfoStyle(fontSize),
    [fontSize]
  );

  const isAtStart = currentPage === 0;
  const isAtEnd = currentPage >= totalPages - 1;

  const handlers = useMemo(
    () => ({
      first: () => onPageChange?.(0),
      prev: () => {
        if (currentPage > 0) {
          onPageChange?.(currentPage - 1);
        }
      },
      next: () => {
        if (currentPage < totalPages - 1) {
          onPageChange?.(currentPage + 1);
        }
      },
      last: () => onPageChange?.(totalPages - 1),
    }),
    [currentPage, totalPages, onPageChange]
  );

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={className} style={containerStyle}>
      {showFirstLast && (
        <PaginationButton
          label="First"
          disabled={disabled || isAtStart}
          onClick={handlers.first}
          size={size}
        />
      )}
      <PaginationButton
        label="Prev"
        disabled={disabled || isAtStart}
        onClick={handlers.prev}
        size={size}
      />
      <span style={pageInfoStyle}>
        {currentPage + 1} / {totalPages}
      </span>
      <PaginationButton
        label="Next"
        disabled={disabled || isAtEnd}
        onClick={handlers.next}
        size={size}
      />
      {showFirstLast && (
        <PaginationButton
          label="Last"
          disabled={disabled || isAtEnd}
          onClick={handlers.last}
          size={size}
        />
      )}
    </div>
  );
});
