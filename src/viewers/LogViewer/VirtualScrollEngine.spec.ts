/**
 * @file VirtualScrollEngine tests
 */

import { createVirtualScrollEngine } from "./VirtualScrollEngine";

describe("VirtualScrollEngine", () => {
  const defaultConfig = { estimatedItemHeight: 36, overscan: 3 };

  describe("createVirtualScrollEngine (curried factory)", () => {
    it("creates engine with config", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      expect(typeof createCalculator).toBe("function");
    });

    it("creates calculator with item count", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      expect(calc.itemCount).toBe(100);
      expect(calc.totalHeight).toBe(3600); // 100 * 36
    });
  });

  describe("getVisibleRange", () => {
    it("returns correct range at scroll position 0", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const range = calc.getVisibleRange(0, 400);

      expect(range.startIndex).toBe(0);
      // With overscan=3, end should be around ceil(400/36) + 3 = 14
      expect(range.endIndex).toBeGreaterThan(10);
      expect(range.items.length).toBe(range.endIndex - range.startIndex);
    });

    it("returns correct range when scrolled", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const range = calc.getVisibleRange(360, 400); // scrolled 10 items down

      expect(range.startIndex).toBe(7); // 10 - overscan(3) = 7
      expect(range.items[0].index).toBe(7);
    });

    it("memoizes results", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const range1 = calc.getVisibleRange(0, 400);
      const range2 = calc.getVisibleRange(0, 400);

      expect(range1).toBe(range2); // Same reference
    });

    it("returns different result when height changes", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const range1 = calc.getVisibleRange(0, 400);
      calc.updateHeight(0, 100);
      const range2 = calc.getVisibleRange(0, 400);

      expect(range1).not.toBe(range2);
    });
  });

  describe("updateHeight", () => {
    it("updates height and returns true", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const result = calc.updateHeight(5, 50);

      expect(result).toBe(true);
      expect(calc.getHeight(5)).toBe(50);
    });

    it("returns false for small changes", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const result = calc.updateHeight(5, 36.3);

      expect(result).toBe(false);
      expect(calc.getHeight(5)).toBe(36);
    });

    it("updates totalHeight", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      calc.updateHeight(0, 100);

      expect(calc.totalHeight).toBe(3600 - 36 + 100);
    });

    it("increments version", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const v1 = calc.version;
      calc.updateHeight(0, 100);
      const v2 = calc.version;

      expect(v2).toBe(v1 + 1);
    });
  });

  describe("updateHeights (batch)", () => {
    it("updates multiple heights at once", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const changed = calc.updateHeights([
        { index: 0, height: 50 },
        { index: 5, height: 60 },
        { index: 10, height: 70 },
      ]);

      expect(changed).toBe(3);
      expect(calc.getHeight(0)).toBe(50);
      expect(calc.getHeight(5)).toBe(60);
      expect(calc.getHeight(10)).toBe(70);
    });

    it("returns count of actually changed items", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);
      calc.updateHeight(0, 50);

      const changed = calc.updateHeights([
        { index: 0, height: 50 }, // no change
        { index: 5, height: 60 }, // change
      ]);

      expect(changed).toBe(1);
    });
  });

  describe("getScrollPosition", () => {
    it("returns correct scroll position", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      expect(calc.getScrollPosition(0)).toBe(0);
      expect(calc.getScrollPosition(1)).toBe(36);
      expect(calc.getScrollPosition(10)).toBe(360);
    });

    it("accounts for height changes", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      calc.updateHeight(0, 100);

      expect(calc.getScrollPosition(1)).toBe(100);
      expect(calc.getScrollPosition(2)).toBe(136);
    });
  });

  describe("getScrollTarget", () => {
    it("returns correct target for align=start", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const target = calc.getScrollTarget(10, 400, "start");

      expect(target).toBe(360); // 10 * 36
    });

    it("returns correct target for align=center", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const target = calc.getScrollTarget(10, 400, "center");

      // position(360) - containerHeight/2(200) + itemHeight/2(18) = 178
      expect(target).toBe(178);
    });

    it("returns correct target for align=end", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const target = calc.getScrollTarget(10, 400, "end");

      // position(360) - containerHeight(400) + itemHeight(36) = -4 -> 0
      expect(target).toBe(0);
    });
  });

  describe("dirty range tracking", () => {
    it("tracks dirty range on update", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      calc.updateHeight(5, 50);
      calc.updateHeight(10, 60);

      expect(calc.isDirtyInRange(0, 5)).toBe(false);
      expect(calc.isDirtyInRange(5, 11)).toBe(true);
      expect(calc.isDirtyInRange(11, 20)).toBe(false);
    });

    it("consumeDirtyRange returns and clears", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      calc.updateHeight(5, 50);
      calc.updateHeight(10, 60);

      const dirty = calc.consumeDirtyRange();
      expect(dirty).toEqual({ start: 5, end: 11 });

      const dirty2 = calc.consumeDirtyRange();
      expect(dirty2).toBeNull();
    });
  });

  describe("resize", () => {
    it("creates new calculator with resized count", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);
      calc.updateHeight(5, 50);

      const newCalc = calc.resize(200);

      expect(newCalc.itemCount).toBe(200);
      expect(newCalc.getHeight(5)).toBe(50); // preserved
    });

    it("preserves heights within new range", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);
      calc.updateHeight(50, 100);

      const newCalc = calc.resize(60);

      expect(newCalc.getHeight(50)).toBe(100);
    });

    it("does not preserve heights beyond new range", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);
      calc.updateHeight(80, 100);

      const newCalc = calc.resize(50);

      expect(newCalc.itemCount).toBe(50);
      // Height at index 80 is lost
    });
  });

  describe("clearCache", () => {
    it("clears memoization cache", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const range1 = calc.getVisibleRange(0, 400);
      calc.clearCache();
      const range2 = calc.getVisibleRange(0, 400);

      // Different object (not from cache)
      expect(range1).not.toBe(range2);
      // But same content
      expect(range1.startIndex).toBe(range2.startIndex);
    });
  });

  describe("virtual items structure", () => {
    it("items have correct structure", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const range = calc.getVisibleRange(0, 400);
      const item = range.items[0];

      expect(item).toHaveProperty("index");
      expect(item).toHaveProperty("start");
      expect(item).toHaveProperty("size");
      expect(item).toHaveProperty("end");
      expect(item.end).toBe(item.start + item.size);
    });

    it("items are immutable (frozen)", () => {
      const createCalculator = createVirtualScrollEngine(defaultConfig);
      const calc = createCalculator(100);

      const range = calc.getVisibleRange(0, 400);

      expect(Object.isFrozen(range)).toBe(true);
    });
  });
});
