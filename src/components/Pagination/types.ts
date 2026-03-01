/**
 * @file Pagination component types
 */

export type PaginationSize = "sm" | "md";

export type PaginationProps = {
  /** Current page (0-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Size variant */
  size?: PaginationSize;
  /** Show first/last buttons */
  showFirstLast?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
};

export type UsePaginationOptions = {
  /** Total item count */
  totalItems: number;
  /** Items per page */
  pageSize: number;
  /** Initial page (0-indexed) */
  initialPage?: number;
};

export type UsePaginationResult = {
  /** Current page (0-indexed) */
  page: number;
  /** Total pages */
  totalPages: number;
  /** Set current page */
  setPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Go to first page */
  firstPage: () => void;
  /** Go to last page */
  lastPage: () => void;
  /** Whether at first page */
  isFirstPage: boolean;
  /** Whether at last page */
  isLastPage: boolean;
  /** Get paginated slice of items */
  getPageItems: <T>(items: readonly T[]) => T[];
  /** Start index for current page (1-indexed for display) */
  startIndex: number;
  /** End index for current page (1-indexed for display) */
  endIndex: number;
};
