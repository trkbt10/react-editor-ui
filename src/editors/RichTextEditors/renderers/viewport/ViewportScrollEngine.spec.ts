/**
 * @file ViewportScrollEngine unit tests
 */
import { createViewportScrollEngine } from "./ViewportScrollEngine";
import type { ViewportState } from "./types";

describe("ViewportScrollEngine", () => {
  const createEngine = createViewportScrollEngine({
    estimatedLineHeight: 21,
    overscan: 3,
  });

  describe("getVisibleLines", () => {
    it("should return visible lines for viewport", () => {
      const calculator = createEngine(100);
      const viewport: ViewportState = {
        offset: { x: 0, y: 0 },
        size: { width: 800, height: 200 },
      };

      const result = calculator.getVisibleLines(viewport);

      // 200px viewport / 21px line = ~10 visible lines
      // With overscan 3, we get 0 to 13 (approximately)
      expect(result.startIndex).toBe(0);
      expect(result.endIndex).toBeGreaterThan(10);
      expect(result.items.length).toBeGreaterThan(10);
    });

    it("should return correct visible range when scrolled", () => {
      const calculator = createEngine(100);
      const viewport: ViewportState = {
        offset: { x: 0, y: 210 }, // Scrolled to line 10
        size: { width: 800, height: 200 },
      };

      const result = calculator.getVisibleLines(viewport);

      // Line 10 starts at Y=210, so visible range should be around 10
      // With overscan 3: startIndex = 10 - 3 = 7
      expect(result.startIndex).toBe(7);
      expect(result.items[0].index).toBe(7);
    });

    it("should include viewport positions in items", () => {
      const calculator = createEngine(100);
      const viewport: ViewportState = {
        offset: { x: 0, y: 42 }, // Scrolled 2 lines
        size: { width: 800, height: 200 },
      };

      const result = calculator.getVisibleLines(viewport);

      // First item should have negative viewportY (above viewport origin)
      const firstItem = result.items[0];
      expect(firstItem.documentY).toBeGreaterThanOrEqual(0);
      expect(firstItem.viewportY).toBe(firstItem.documentY - 42);
    });

    it("should be memoized", () => {
      const calculator = createEngine(100);
      const viewport: ViewportState = {
        offset: { x: 0, y: 0 },
        size: { width: 800, height: 200 },
      };

      const result1 = calculator.getVisibleLines(viewport);
      const result2 = calculator.getVisibleLines(viewport);

      // Same object reference due to memoization
      expect(result1).toBe(result2);
    });

    it("should invalidate cache when heights change", () => {
      const calculator = createEngine(100);
      const viewport: ViewportState = {
        offset: { x: 0, y: 0 },
        size: { width: 800, height: 200 },
      };

      const result1 = calculator.getVisibleLines(viewport);
      calculator.updateLineHeight(5, 42);
      const result2 = calculator.getVisibleLines(viewport);

      // Different object due to cache invalidation
      expect(result1).not.toBe(result2);
    });
  });

  describe("updateLineHeight", () => {
    it("should update height and return true when changed", () => {
      const calculator = createEngine(10);

      const changed = calculator.updateLineHeight(5, 42);

      expect(changed).toBe(true);
    });

    it("should return false for small changes", () => {
      const calculator = createEngine(10);

      const changed = calculator.updateLineHeight(5, 21.3);

      expect(changed).toBe(false);
    });

    it("should return false for out-of-bounds index", () => {
      const calculator = createEngine(10);

      expect(calculator.updateLineHeight(-1, 42)).toBe(false);
      expect(calculator.updateLineHeight(10, 42)).toBe(false);
    });
  });

  describe("updateLineWidth", () => {
    it("should update width and return true when changed", () => {
      const calculator = createEngine(10);

      const changed = calculator.updateLineWidth(5, 500);

      expect(changed).toBe(true);
      expect(calculator.getDocumentDimensions().width).toBe(500);
    });

    it("should track max width", () => {
      const calculator = createEngine(10);

      calculator.updateLineWidth(0, 300);
      calculator.updateLineWidth(5, 500);
      calculator.updateLineWidth(9, 400);

      expect(calculator.getDocumentDimensions().width).toBe(500);
    });
  });

  describe("coordinate transformation", () => {
    it("should transform viewport to document coordinates", () => {
      const calculator = createEngine(100);
      const viewport: ViewportState = {
        offset: { x: 50, y: 100 },
        size: { width: 800, height: 600 },
      };

      const doc = calculator.viewportToDocument(10, 20, viewport);

      expect(doc.x).toBe(60); // 10 + 50
      expect(doc.y).toBe(120); // 20 + 100
    });

    it("should transform document to viewport coordinates", () => {
      const calculator = createEngine(100);
      const viewport: ViewportState = {
        offset: { x: 50, y: 100 },
        size: { width: 800, height: 600 },
      };

      const vp = calculator.documentToViewport(60, 120, viewport);

      expect(vp.x).toBe(10); // 60 - 50
      expect(vp.y).toBe(20); // 120 - 100
    });

    it("should be reversible", () => {
      const calculator = createEngine(100);
      const viewport: ViewportState = {
        offset: { x: 123, y: 456 },
        size: { width: 800, height: 600 },
      };

      const doc = calculator.viewportToDocument(10, 20, viewport);
      const vp = calculator.documentToViewport(doc.x, doc.y, viewport);

      expect(vp.x).toBe(10);
      expect(vp.y).toBe(20);
    });
  });

  describe("getScrollTargetY", () => {
    it("should return line Y for start alignment", () => {
      const calculator = createEngine(100);

      const target = calculator.getScrollTargetY(10, "start");

      expect(target).toBe(210); // 10 * 21
    });

    it("should return line center for center alignment", () => {
      const calculator = createEngine(100);

      const target = calculator.getScrollTargetY(10, "center");

      expect(target).toBe(210 + 10.5); // Line Y + half line height
    });

    it("should return line end for end alignment", () => {
      const calculator = createEngine(100);

      const target = calculator.getScrollTargetY(10, "end");

      expect(target).toBe(231); // 10 * 21 + 21
    });
  });

  describe("getDocumentDimensions", () => {
    it("should return correct dimensions", () => {
      const calculator = createEngine(100);

      calculator.updateLineWidth(50, 1000);

      const dims = calculator.getDocumentDimensions();

      expect(dims.lineCount).toBe(100);
      expect(dims.height).toBe(2100); // 100 * 21
      expect(dims.width).toBe(1000);
    });
  });

  describe("resize", () => {
    it("should handle growing", () => {
      const calculator = createEngine(10);

      calculator.resize(20);

      expect(calculator.getDocumentDimensions().lineCount).toBe(20);
      expect(calculator.getDocumentDimensions().height).toBe(420); // 20 * 21
    });

    it("should handle shrinking", () => {
      const calculator = createEngine(20);

      calculator.resize(10);

      expect(calculator.getDocumentDimensions().lineCount).toBe(10);
      expect(calculator.getDocumentDimensions().height).toBe(210);
    });
  });

  describe("version", () => {
    it("should increment on height updates", () => {
      const calculator = createEngine(10);
      const v1 = calculator.version;

      calculator.updateLineHeight(5, 42);
      const v2 = calculator.version;

      expect(v2).toBeGreaterThan(v1);
    });

    it("should increment on width updates", () => {
      const calculator = createEngine(10);
      const v1 = calculator.version;

      calculator.updateLineWidth(5, 500);
      const v2 = calculator.version;

      expect(v2).toBeGreaterThan(v1);
    });
  });
});
