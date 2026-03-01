/**
 * @file usePagination hook tests
 */

import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  describe("initialization", () => {
    it("initializes with default page 0", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 })
      );

      expect(result.current.page).toBe(0);
      expect(result.current.totalPages).toBe(10);
      expect(result.current.isFirstPage).toBe(true);
      expect(result.current.isLastPage).toBe(false);
    });

    it("initializes with custom initial page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10, initialPage: 5 })
      );

      expect(result.current.page).toBe(5);
    });

    it("clamps initial page to valid range", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10, initialPage: 20 })
      );

      expect(result.current.page).toBe(9); // Last valid page
    });
  });

  describe("totalPages calculation", () => {
    it("calculates total pages correctly", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 95, pageSize: 10 })
      );

      expect(result.current.totalPages).toBe(10); // 95/10 = 9.5, rounded up
    });

    it("returns 1 for empty items", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 0, pageSize: 10 })
      );

      expect(result.current.totalPages).toBe(1);
    });
  });

  describe("navigation", () => {
    it("nextPage increments page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(1);
    });

    it("nextPage does not exceed last page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10, initialPage: 9 })
      );

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.page).toBe(9);
    });

    it("prevPage decrements page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10, initialPage: 5 })
      );

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(4);
    });

    it("prevPage does not go below 0", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 })
      );

      act(() => {
        result.current.prevPage();
      });

      expect(result.current.page).toBe(0);
    });

    it("firstPage goes to page 0", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10, initialPage: 5 })
      );

      act(() => {
        result.current.firstPage();
      });

      expect(result.current.page).toBe(0);
    });

    it("lastPage goes to last page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 })
      );

      act(() => {
        result.current.lastPage();
      });

      expect(result.current.page).toBe(9);
    });

    it("setPage sets specific page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 })
      );

      act(() => {
        result.current.setPage(7);
      });

      expect(result.current.page).toBe(7);
    });

    it("setPage clamps to valid range", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 })
      );

      act(() => {
        result.current.setPage(100);
      });

      expect(result.current.page).toBe(9);

      act(() => {
        result.current.setPage(-5);
      });

      expect(result.current.page).toBe(0);
    });
  });

  describe("boundary flags", () => {
    it("isFirstPage is true on first page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 })
      );

      expect(result.current.isFirstPage).toBe(true);
      expect(result.current.isLastPage).toBe(false);
    });

    it("isLastPage is true on last page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10, initialPage: 9 })
      );

      expect(result.current.isFirstPage).toBe(false);
      expect(result.current.isLastPage).toBe(true);
    });

    it("both flags true for single page", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 5, pageSize: 10 })
      );

      expect(result.current.isFirstPage).toBe(true);
      expect(result.current.isLastPage).toBe(true);
    });
  });

  describe("getPageItems", () => {
    it("returns correct slice of items", () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const { result } = renderHook(() =>
        usePagination({ totalItems: 10, pageSize: 3 })
      );

      expect(result.current.getPageItems(items)).toEqual([1, 2, 3]);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.getPageItems(items)).toEqual([4, 5, 6]);
    });

    it("handles last page with fewer items", () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const { result } = renderHook(() =>
        usePagination({ totalItems: 10, pageSize: 3, initialPage: 3 })
      );

      expect(result.current.getPageItems(items)).toEqual([10]);
    });
  });

  describe("indices", () => {
    it("returns correct 1-indexed start and end", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 100, pageSize: 10 })
      );

      expect(result.current.startIndex).toBe(1);
      expect(result.current.endIndex).toBe(10);

      act(() => {
        result.current.nextPage();
      });

      expect(result.current.startIndex).toBe(11);
      expect(result.current.endIndex).toBe(20);
    });

    it("handles last page correctly", () => {
      const { result } = renderHook(() =>
        usePagination({ totalItems: 95, pageSize: 10, initialPage: 9 })
      );

      expect(result.current.startIndex).toBe(91);
      expect(result.current.endIndex).toBe(95);
    });
  });
});
