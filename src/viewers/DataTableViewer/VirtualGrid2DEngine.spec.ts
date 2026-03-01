import { describe, it, expect } from "vitest";
import { createVirtualGrid2DEngine } from "./VirtualGrid2DEngine";

describe("VirtualGrid2DEngine", () => {
  const createEngine = () =>
    createVirtualGrid2DEngine({
      estimatedRowHeight: 28,
      estimatedColumnWidth: 100,
      overscanRows: 2,
      overscanColumns: 1,
    });

  describe("createCalculator", () => {
    it("should create calculator with correct dimensions", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      expect(calc.rowCount).toBe(100);
      expect(calc.columnCount).toBe(10);
      expect(calc.totalHeight).toBe(100 * 28);
      expect(calc.totalWidth).toBe(10 * 100);
    });

    it("should handle empty grid", () => {
      const engine = createEngine();
      const calc = engine(0, 0);

      expect(calc.rowCount).toBe(0);
      expect(calc.columnCount).toBe(0);
      expect(calc.totalHeight).toBe(0);
      expect(calc.totalWidth).toBe(0);
    });
  });

  describe("getVisibleRange", () => {
    it("should return correct range at scroll position 0,0", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const range = calc.getVisibleRange(0, 0, 280, 500);

      // With containerHeight=280 and rowHeight=28, ~10 rows visible
      // Plus overscan=2, so 0 to 12
      expect(range.startRow).toBe(0);
      expect(range.endRow).toBeLessThanOrEqual(14);
      expect(range.startRow).toBeGreaterThanOrEqual(0);

      // With containerWidth=500 and colWidth=100, 5 columns visible
      // Plus overscan=1, so 0 to 6
      expect(range.startCol).toBe(0);
      expect(range.endCol).toBeLessThanOrEqual(8);

      expect(range.items.length).toBeGreaterThan(0);
    });

    it("should return correct range after scrolling", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      // Scroll down 560px (20 rows * 28px)
      const range = calc.getVisibleRange(560, 200, 280, 500);

      // Should start around row 18 (20 - overscan)
      expect(range.startRow).toBeGreaterThanOrEqual(18);
      expect(range.startRow).toBeLessThanOrEqual(20);

      // Should start around col 1 (2 - overscan)
      expect(range.startCol).toBeGreaterThanOrEqual(0);
      expect(range.startCol).toBeLessThanOrEqual(2);
    });

    it("should return correct item positions", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const range = calc.getVisibleRange(0, 0, 280, 500);
      const firstItem = range.items[0];

      expect(firstItem.rowIndex).toBe(0);
      expect(firstItem.colIndex).toBe(0);
      expect(firstItem.x).toBe(0);
      expect(firstItem.y).toBe(0);
      expect(firstItem.width).toBe(100);
      expect(firstItem.height).toBe(28);
    });

    it("should be memoized for same inputs", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const range1 = calc.getVisibleRange(0, 0, 280, 500);
      const range2 = calc.getVisibleRange(0, 0, 280, 500);

      expect(range1).toBe(range2);
    });

    it("should invalidate cache after height update", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const range1 = calc.getVisibleRange(0, 0, 280, 500);
      calc.updateRowHeight(0, 50);
      const range2 = calc.getVisibleRange(0, 0, 280, 500);

      expect(range1).not.toBe(range2);
    });
  });

  describe("updateRowHeight", () => {
    it("should update row height and return true", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const changed = calc.updateRowHeight(5, 50);

      expect(changed).toBe(true);
      expect(calc.getRowHeight(5)).toBe(50);
    });

    it("should return false for same height", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const changed = calc.updateRowHeight(5, 28);

      expect(changed).toBe(false);
    });

    it("should update totalHeight", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const originalHeight = calc.totalHeight;
      calc.updateRowHeight(5, 50);

      expect(calc.totalHeight).toBe(originalHeight + 22); // 50 - 28 = 22
    });
  });

  describe("updateColumnWidth", () => {
    it("should update column width and return true", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const changed = calc.updateColumnWidth(3, 200);

      expect(changed).toBe(true);
      expect(calc.getColumnWidth(3)).toBe(200);
    });

    it("should return false for same width", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const changed = calc.updateColumnWidth(3, 100);

      expect(changed).toBe(false);
    });

    it("should update totalWidth", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const originalWidth = calc.totalWidth;
      calc.updateColumnWidth(3, 200);

      expect(calc.totalWidth).toBe(originalWidth + 100); // 200 - 100 = 100
    });
  });

  describe("batch updates", () => {
    it("should batch update row heights", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const changed = calc.updateRowHeights([
        { index: 0, height: 50 },
        { index: 1, height: 50 },
        { index: 2, height: 28 }, // same as original
      ]);

      expect(changed).toBe(2);
      expect(calc.getRowHeight(0)).toBe(50);
      expect(calc.getRowHeight(1)).toBe(50);
      expect(calc.getRowHeight(2)).toBe(28);
    });

    it("should batch update column widths", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const changed = calc.updateColumnWidths([
        { index: 0, width: 150 },
        { index: 1, width: 150 },
      ]);

      expect(changed).toBe(2);
      expect(calc.getColumnWidth(0)).toBe(150);
      expect(calc.getColumnWidth(1)).toBe(150);
    });
  });

  describe("position calculations", () => {
    it("should return correct row position", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      expect(calc.getRowPosition(0)).toBe(0);
      expect(calc.getRowPosition(1)).toBe(28);
      expect(calc.getRowPosition(5)).toBe(28 * 5);
    });

    it("should return correct column position", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      expect(calc.getColumnPosition(0)).toBe(0);
      expect(calc.getColumnPosition(1)).toBe(100);
      expect(calc.getColumnPosition(5)).toBe(100 * 5);
    });

    it("should return correct position after height update", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      calc.updateRowHeight(0, 50);

      expect(calc.getRowPosition(0)).toBe(0);
      expect(calc.getRowPosition(1)).toBe(50);
      expect(calc.getRowPosition(2)).toBe(50 + 28);
    });
  });

  describe("scroll target calculations", () => {
    it("should calculate scroll target for row (start)", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const target = calc.getScrollTargetForRow(10, 280, "start");

      expect(target).toBe(28 * 10);
    });

    it("should calculate scroll target for row (center)", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const target = calc.getScrollTargetForRow(10, 280, "center");
      const rowPosition = 28 * 10;
      const expected = rowPosition - 280 / 2 + 28 / 2;

      expect(target).toBe(expected);
    });

    it("should calculate scroll target for row (end)", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const target = calc.getScrollTargetForRow(10, 280, "end");
      const rowPosition = 28 * 10;
      const expected = rowPosition - 280 + 28;

      expect(target).toBe(expected);
    });

    it("should calculate scroll target for column", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const target = calc.getScrollTargetForColumn(5, 500, "start");

      expect(target).toBe(100 * 5);
    });
  });

  describe("resize", () => {
    it("should resize to larger dimensions", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      calc.updateRowHeight(5, 50);
      calc.updateColumnWidth(3, 200);

      const newCalc = calc.resize(200, 20);

      expect(newCalc.rowCount).toBe(200);
      expect(newCalc.columnCount).toBe(20);
      expect(newCalc.getRowHeight(5)).toBe(50);
      expect(newCalc.getColumnWidth(3)).toBe(200);
    });

    it("should resize to smaller dimensions", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      calc.updateRowHeight(5, 50);
      calc.updateColumnWidth(3, 200);

      const newCalc = calc.resize(50, 5);

      expect(newCalc.rowCount).toBe(50);
      expect(newCalc.columnCount).toBe(5);
      expect(newCalc.getRowHeight(5)).toBe(50);
      expect(newCalc.getColumnWidth(3)).toBe(200);
    });

    it("should not copy heights beyond new size", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      calc.updateRowHeight(50, 50);

      const newCalc = calc.resize(30, 5);

      expect(newCalc.rowCount).toBe(30);
      // Row 50 doesn't exist in new calc
    });
  });

  describe("version", () => {
    it("should increment version on row height update", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const v1 = calc.version;
      calc.updateRowHeight(0, 50);
      const v2 = calc.version;

      expect(v2).toBe(v1 + 1);
    });

    it("should increment version on column width update", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const v1 = calc.version;
      calc.updateColumnWidth(0, 200);
      const v2 = calc.version;

      expect(v2).toBe(v1 + 1);
    });

    it("should not increment version for no change", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const v1 = calc.version;
      calc.updateRowHeight(0, 28); // same as default
      const v2 = calc.version;

      expect(v2).toBe(v1);
    });
  });

  describe("clearCache", () => {
    it("should clear the cache", () => {
      const engine = createEngine();
      const calc = engine(100, 10);

      const range1 = calc.getVisibleRange(0, 0, 280, 500);
      calc.clearCache();
      const range2 = calc.getVisibleRange(0, 0, 280, 500);

      // After clear, should return new object (but equal values)
      expect(range1).not.toBe(range2);
      expect(range1.startRow).toBe(range2.startRow);
    });
  });
});
