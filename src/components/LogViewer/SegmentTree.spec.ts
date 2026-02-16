/**
 * @file SegmentTree tests
 */

import { createSegmentTree } from "./SegmentTree";

describe("createSegmentTree", () => {
  describe("factory", () => {
    it("creates empty tree", () => {
      const tree = createSegmentTree();
      expect(tree.length).toBe(0);
      expect(tree.total).toBe(0);
    });

    it("creates tree with initial values", () => {
      const tree = createSegmentTree([10, 20, 30, 40]);
      expect(tree.length).toBe(4);
      expect(tree.total).toBe(100);
    });
  });

  describe("get", () => {
    it("returns value at index", () => {
      const tree = createSegmentTree([10, 20, 30, 40]);
      expect(tree.get(0)).toBe(10);
      expect(tree.get(1)).toBe(20);
      expect(tree.get(2)).toBe(30);
      expect(tree.get(3)).toBe(40);
    });

    it("returns 0 for out of bounds index", () => {
      const tree = createSegmentTree([10, 20]);
      expect(tree.get(-1)).toBe(0);
      expect(tree.get(5)).toBe(0);
    });
  });

  describe("update", () => {
    it("updates value and maintains correct sums", () => {
      const tree = createSegmentTree([10, 20, 30, 40]);
      tree.update(1, 50);

      expect(tree.get(1)).toBe(50);
      expect(tree.total).toBe(130); // 10 + 50 + 30 + 40
    });

    it("ignores out of bounds updates", () => {
      const tree = createSegmentTree([10, 20, 30]);
      tree.update(-1, 100);
      tree.update(5, 100);

      expect(tree.total).toBe(60);
    });
  });

  describe("prefixSum", () => {
    it("returns correct prefix sums", () => {
      const tree = createSegmentTree([10, 20, 30, 40]);

      expect(tree.prefixSum(0)).toBe(0);
      expect(tree.prefixSum(1)).toBe(10);
      expect(tree.prefixSum(2)).toBe(30);
      expect(tree.prefixSum(3)).toBe(60);
      expect(tree.prefixSum(4)).toBe(100);
    });

    it("returns 0 for negative index", () => {
      const tree = createSegmentTree([10, 20]);
      expect(tree.prefixSum(-5)).toBe(0);
    });

    it("clamps to total for large index", () => {
      const tree = createSegmentTree([10, 20]);
      expect(tree.prefixSum(100)).toBe(30);
    });
  });

  describe("rangeSum", () => {
    it("returns correct range sums", () => {
      const tree = createSegmentTree([10, 20, 30, 40]);

      expect(tree.rangeSum(0, 2)).toBe(30); // 10 + 20
      expect(tree.rangeSum(1, 3)).toBe(50); // 20 + 30
      expect(tree.rangeSum(0, 4)).toBe(100); // all
    });

    it("returns 0 for empty range", () => {
      const tree = createSegmentTree([10, 20, 30]);
      expect(tree.rangeSum(2, 2)).toBe(0);
    });
  });

  describe("findIndexByOffset", () => {
    it("finds correct index for offset", () => {
      // Heights: 10, 20, 30, 40
      // Cumulative: 10, 30, 60, 100
      const tree = createSegmentTree([10, 20, 30, 40]);

      expect(tree.findIndexByOffset(0)).toBe(0);
      expect(tree.findIndexByOffset(5)).toBe(0); // Still in first item
      expect(tree.findIndexByOffset(10)).toBe(1); // Exactly at second item start
      expect(tree.findIndexByOffset(15)).toBe(1); // Within second item
      expect(tree.findIndexByOffset(30)).toBe(2); // At third item start
      expect(tree.findIndexByOffset(59)).toBe(2); // Just before fourth item
      expect(tree.findIndexByOffset(60)).toBe(3); // At fourth item start
    });

    it("returns 0 for negative offset", () => {
      const tree = createSegmentTree([10, 20, 30]);
      expect(tree.findIndexByOffset(-10)).toBe(0);
    });

    it("returns length for offset beyond total", () => {
      const tree = createSegmentTree([10, 20, 30]);
      expect(tree.findIndexByOffset(100)).toBe(3);
    });
  });

  describe("resize", () => {
    it("grows tree with default values", () => {
      const tree = createSegmentTree([10, 20]);
      tree.resize(5, 30);

      expect(tree.length).toBe(5);
      expect(tree.get(0)).toBe(10);
      expect(tree.get(1)).toBe(20);
      expect(tree.get(2)).toBe(30);
      expect(tree.get(3)).toBe(30);
      expect(tree.get(4)).toBe(30);
      expect(tree.total).toBe(120); // 10 + 20 + 30 + 30 + 30
    });

    it("shrinks tree", () => {
      const tree = createSegmentTree([10, 20, 30, 40, 50]);
      tree.resize(3);

      expect(tree.length).toBe(3);
      expect(tree.total).toBe(60); // 10 + 20 + 30
    });

    it("maintains correct sums after resize", () => {
      const tree = createSegmentTree([10, 20, 30]);
      tree.resize(5, 15);
      tree.update(3, 25);

      expect(tree.total).toBe(100); // 10 + 20 + 30 + 25 + 15
      expect(tree.prefixSum(4)).toBe(85); // 10 + 20 + 30 + 25
    });
  });

  describe("performance", () => {
    it("handles large arrays efficiently", () => {
      const size = 100000;
      const values = new Array(size).fill(36) as number[];
      const tree = createSegmentTree(values);

      expect(tree.length).toBe(size);
      expect(tree.total).toBe(size * 36);

      // Verify O(log n) operations are fast
      const start = performance.now();
      Array.from({ length: 10000 }).forEach(() => {
        tree.prefixSum(Math.floor(Math.random() * size));
        tree.findIndexByOffset(Math.random() * tree.total);
      });
      const elapsed = performance.now() - start;

      // Should complete 20000 operations in under 100ms
      expect(elapsed).toBeLessThan(100);
    });
  });
});
