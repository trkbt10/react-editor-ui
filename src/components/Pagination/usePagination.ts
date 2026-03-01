/**
 * @file usePagination hook for pagination logic
 */

import { useState, useMemo, useCallback } from "react";
import type { UsePaginationOptions, UsePaginationResult } from "./types";

/**
 * Hook for managing pagination state and logic.
 *
 * @example
 * ```tsx
 * const { page, totalPages, nextPage, getPageItems } = usePagination({
 *   totalItems: items.length,
 *   pageSize: 20,
 * });
 *
 * const displayItems = getPageItems(items);
 * ```
 */
export function usePagination({
  totalItems,
  pageSize,
  initialPage = 0,
}: UsePaginationOptions): UsePaginationResult {
  const [page, setPageInternal] = useState(initialPage);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  // Clamp page to valid range when totalItems/pageSize changes
  const clampedPage = useMemo(
    () => Math.min(page, Math.max(0, totalPages - 1)),
    [page, totalPages]
  );

  const setPage = useCallback(
    (newPage: number) => {
      const clamped = Math.max(0, Math.min(newPage, totalPages - 1));
      setPageInternal(clamped);
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setPageInternal((prev) => Math.min(prev + 1, totalPages - 1));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPageInternal((prev) => Math.max(prev - 1, 0));
  }, []);

  const firstPage = useCallback(() => {
    setPageInternal(0);
  }, []);

  const lastPage = useCallback(() => {
    setPageInternal(totalPages - 1);
  }, [totalPages]);

  const isFirstPage = clampedPage === 0;
  const isLastPage = clampedPage >= totalPages - 1;

  const getPageItems = useCallback(
    <T>(items: readonly T[]): T[] => {
      const start = clampedPage * pageSize;
      return items.slice(start, start + pageSize) as T[];
    },
    [clampedPage, pageSize]
  );

  // 1-indexed for display
  const startIndex = clampedPage * pageSize + 1;
  const endIndex = Math.min((clampedPage + 1) * pageSize, totalItems);

  return {
    page: clampedPage,
    totalPages,
    setPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    isFirstPage,
    isLastPage,
    getPageItems,
    startIndex,
    endIndex,
  };
}
