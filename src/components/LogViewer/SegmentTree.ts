/**
 * @file Segment Tree for efficient range sum queries
 *
 * Used for calculating cumulative heights in virtual scrolling.
 * Supports O(log n) updates and O(log n) prefix sum queries.
 */

/**
 * Segment Tree implementation optimized for cumulative height calculations.
 * Uses a Fenwick Tree (Binary Indexed Tree) internally for simplicity and performance.
 */
// eslint-disable-next-line no-restricted-syntax -- Data structure with mutable state requires class
export class SegmentTree {
  private tree: number[];
  private values: number[];
  private size: number;

  constructor(initialValues: number[] = []) {
    this.size = initialValues.length;
    this.values = [...initialValues];
    this.tree = new Array(this.size + 1).fill(0);

    // Build the tree
    for (let i = 0; i < this.size; i++) {
      this.updateTree(i, initialValues[i]);
    }
  }

  private updateTree(index: number, delta: number): void {
    for (let i = index + 1; i <= this.size; i += i & -i) {
      this.tree[i] += delta;
    }
  }

  /**
   * Get the value at a specific index
   */
  get(index: number): number {
    if (index < 0 || index >= this.size) {
      return 0;
    }
    return this.values[index];
  }

  /**
   * Update the value at a specific index
   * O(log n) complexity
   */
  update(index: number, value: number): void {
    if (index < 0 || index >= this.size) {
      return;
    }
    const delta = value - this.values[index];
    this.values[index] = value;
    this.updateTree(index, delta);
  }

  /**
   * Get the prefix sum from index 0 to endIndex (exclusive)
   * O(log n) complexity
   */
  prefixSum(endIndex: number): number {
    if (endIndex <= 0) {
      return 0;
    }
    const idx = Math.min(endIndex, this.size);
    // eslint-disable-next-line no-restricted-syntax -- Fenwick Tree algorithm requires accumulator
    let sum = 0;
    for (let i = idx; i > 0; i -= i & -i) {
      sum += this.tree[i];
    }
    return sum;
  }

  /**
   * Get the sum in range [startIndex, endIndex)
   * O(log n) complexity
   */
  rangeSum(startIndex: number, endIndex: number): number {
    return this.prefixSum(endIndex) - this.prefixSum(startIndex);
  }

  /**
   * Find the index where the prefix sum exceeds the target value.
   * Returns the first index i where prefixSum(i) >= target.
   * O(log n) complexity using binary search on the tree.
   */
  findIndexByOffset(targetOffset: number): number {
    if (targetOffset <= 0) {
      return 0;
    }

    const totalSum = this.prefixSum(this.size);
    if (targetOffset >= totalSum) {
      return this.size;
    }

    // Binary search on prefix sums
    const binarySearch = (left: number, right: number): number => {
      if (left >= right) {
        return left;
      }
      const mid = Math.floor((left + right) / 2);
      const sum = this.prefixSum(mid + 1);
      return sum <= targetOffset ? binarySearch(mid + 1, right) : binarySearch(left, mid);
    };

    return binarySearch(0, this.size);
  }

  /**
   * Resize the tree to accommodate more elements
   */
  resize(newSize: number, defaultValue: number = 0): void {
    if (newSize <= this.size) {
      // Shrink: just update size
      this.size = newSize;
      this.values.length = newSize;
      // Rebuild tree for shrinking
      this.tree = new Array(this.size + 1).fill(0);
      for (let i = 0; i < this.size; i++) {
        this.updateTree(i, this.values[i]);
      }
    } else {
      // Grow: add new elements
      const oldSize = this.size;
      this.size = newSize;
      this.tree = new Array(this.size + 1).fill(0);

      // Extend values array
      for (let i = oldSize; i < newSize; i++) {
        this.values.push(defaultValue);
      }

      // Rebuild tree
      for (let i = 0; i < this.size; i++) {
        this.updateTree(i, this.values[i]);
      }
    }
  }

  /**
   * Get the total sum of all elements
   */
  get total(): number {
    return this.prefixSum(this.size);
  }

  /**
   * Get the number of elements
   */
  get length(): number {
    return this.size;
  }
}
