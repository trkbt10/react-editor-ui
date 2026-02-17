/**
 * @file LineHeightTree unit tests
 */
import { createLineHeightTree } from "./LineHeightTree";

describe("LineHeightTree", () => {
  describe("basic operations", () => {
    it("should create tree with initial line count and default height", () => {
      const tree = createLineHeightTree(10, 21);

      expect(tree.lineCount).toBe(10);
      expect(tree.totalHeight).toBe(210); // 10 * 21
    });

    it("should get height of a line", () => {
      const tree = createLineHeightTree(10, 21);

      expect(tree.get(0)).toBe(21);
      expect(tree.get(5)).toBe(21);
      expect(tree.get(9)).toBe(21);
    });

    it("should return 0 for out-of-bounds index", () => {
      const tree = createLineHeightTree(10, 21);

      expect(tree.get(-1)).toBe(0);
      expect(tree.get(10)).toBe(0);
      expect(tree.get(100)).toBe(0);
    });
  });

  describe("prefixSum", () => {
    it("should calculate cumulative height correctly", () => {
      const tree = createLineHeightTree(10, 21);

      expect(tree.prefixSum(0)).toBe(0);
      expect(tree.prefixSum(1)).toBe(21);
      expect(tree.prefixSum(5)).toBe(105);
      expect(tree.prefixSum(10)).toBe(210);
    });

    it("should handle mixed heights", () => {
      const tree = createLineHeightTree(5, 20);

      tree.update(1, 30);
      tree.update(3, 40);

      // Heights: [20, 30, 20, 40, 20]
      expect(tree.prefixSum(0)).toBe(0);
      expect(tree.prefixSum(1)).toBe(20);
      expect(tree.prefixSum(2)).toBe(50); // 20 + 30
      expect(tree.prefixSum(3)).toBe(70); // 20 + 30 + 20
      expect(tree.prefixSum(4)).toBe(110); // 20 + 30 + 20 + 40
      expect(tree.prefixSum(5)).toBe(130); // 20 + 30 + 20 + 40 + 20
    });
  });

  describe("rangeSum", () => {
    it("should calculate height sum for a range", () => {
      const tree = createLineHeightTree(10, 21);

      expect(tree.rangeSum(0, 5)).toBe(105); // Lines 0-4
      expect(tree.rangeSum(3, 7)).toBe(84); // Lines 3-6
    });
  });

  describe("update", () => {
    it("should update line height and increment version", () => {
      const tree = createLineHeightTree(10, 21);
      const initialVersion = tree.version;

      tree.update(5, 42);

      expect(tree.get(5)).toBe(42);
      expect(tree.totalHeight).toBe(21 * 9 + 42); // 9 lines * 21 + 1 line * 42
      expect(tree.version).toBeGreaterThan(initialVersion);
    });

    it("should ignore small changes (< 0.5px)", () => {
      const tree = createLineHeightTree(10, 21);
      const initialVersion = tree.version;

      tree.update(5, 21.3); // Small change

      expect(tree.get(5)).toBe(21); // Unchanged
      expect(tree.version).toBe(initialVersion);
    });

    it("should not update out-of-bounds index", () => {
      const tree = createLineHeightTree(10, 21);
      const initialVersion = tree.version;

      tree.update(-1, 100);
      tree.update(10, 100);

      expect(tree.totalHeight).toBe(210);
      expect(tree.version).toBe(initialVersion);
    });
  });

  describe("findLineByOffset", () => {
    it("should find line at Y offset", () => {
      const tree = createLineHeightTree(10, 21);

      expect(tree.findLineByOffset(0)).toBe(0);
      expect(tree.findLineByOffset(10)).toBe(0);
      expect(tree.findLineByOffset(21)).toBe(1);
      expect(tree.findLineByOffset(42)).toBe(2);
      expect(tree.findLineByOffset(105)).toBe(5);
    });

    it("should handle negative offset", () => {
      const tree = createLineHeightTree(10, 21);

      expect(tree.findLineByOffset(-10)).toBe(0);
    });

    it("should handle offset beyond total height", () => {
      const tree = createLineHeightTree(10, 21);

      expect(tree.findLineByOffset(500)).toBe(10);
    });

    it("should work with variable heights", () => {
      const tree = createLineHeightTree(5, 20);

      tree.update(1, 40);
      tree.update(3, 60);

      // Heights: [20, 40, 20, 60, 20]
      // Cumulative: [20, 60, 80, 140, 160]
      expect(tree.findLineByOffset(0)).toBe(0);
      expect(tree.findLineByOffset(19)).toBe(0);
      expect(tree.findLineByOffset(20)).toBe(1);
      expect(tree.findLineByOffset(59)).toBe(1);
      expect(tree.findLineByOffset(60)).toBe(2);
      expect(tree.findLineByOffset(79)).toBe(2);
      expect(tree.findLineByOffset(80)).toBe(3);
      expect(tree.findLineByOffset(139)).toBe(3);
      expect(tree.findLineByOffset(140)).toBe(4);
    });
  });

  describe("resize", () => {
    it("should grow tree and add new lines with default height", () => {
      const tree = createLineHeightTree(5, 21);

      tree.resize(10, 21);

      expect(tree.lineCount).toBe(10);
      expect(tree.totalHeight).toBe(210);
      expect(tree.get(7)).toBe(21);
    });

    it("should shrink tree", () => {
      const tree = createLineHeightTree(10, 21);

      tree.resize(5);

      expect(tree.lineCount).toBe(5);
      expect(tree.totalHeight).toBe(105);
    });

    it("should preserve existing heights when growing", () => {
      const tree = createLineHeightTree(3, 21);

      tree.update(1, 42);
      tree.resize(5, 21);

      expect(tree.get(1)).toBe(42);
      expect(tree.get(3)).toBe(21);
    });

    it("should increment version", () => {
      const tree = createLineHeightTree(5, 21);
      const initialVersion = tree.version;

      tree.resize(10);

      expect(tree.version).toBeGreaterThan(initialVersion);
    });
  });

  describe("performance", () => {
    it("should handle 100k lines efficiently", () => {
      const lineCount = 100000;
      const tree = createLineHeightTree(lineCount, 21);

      const startTime = performance.now();

      // Simulate 10k random operations
      for (let i = 0; i < 10000; i++) {
        const lineIndex = Math.floor(Math.random() * lineCount);
        tree.update(lineIndex, 20 + Math.random() * 10);
        tree.prefixSum(lineIndex);
        tree.findLineByOffset(Math.random() * tree.totalHeight);
      }

      const elapsed = performance.now() - startTime;

      // Should complete in under 500ms
      expect(elapsed).toBeLessThan(500);
    });
  });
});
