/**
 * @file Segment Tree for efficient range sum queries
 *
 * Used for calculating cumulative heights in virtual scrolling.
 * Supports O(log n) updates and O(log n) prefix sum queries.
 */

/**
 * Segment Tree type for cumulative height calculations.
 * Uses a Fenwick Tree (Binary Indexed Tree) internally for simplicity and performance.
 */
export type SegmentTree = {
  /** Get the value at a specific index */
  get: (index: number) => number;
  /** Update the value at a specific index - O(log n) */
  update: (index: number, value: number) => void;
  /** Get the prefix sum from index 0 to endIndex (exclusive) - O(log n) */
  prefixSum: (endIndex: number) => number;
  /** Get the sum in range [startIndex, endIndex) - O(log n) */
  rangeSum: (startIndex: number, endIndex: number) => number;
  /** Find the index where the prefix sum exceeds the target value - O(log n) */
  findIndexByOffset: (targetOffset: number) => number;
  /** Resize the tree to accommodate more elements */
  resize: (newSize: number, defaultValue?: number) => void;
  /** Get the total sum of all elements */
  readonly total: number;
  /** Get the number of elements */
  readonly length: number;
};

type MutableState = {
  tree: number[];
  values: number[];
  size: number;
};

/**
 * Generate Fenwick Tree indices for update operation.
 * Yields indices from (index + 1) to size, incrementing by lowest set bit.
 */
const generateUpdateIndices = (
  index: number,
  size: number,
  acc: number[] = []
): number[] => {
  const i = index + 1;
  if (i > size) {
    return acc;
  }
  return generateUpdateIndices(i + (i & -i) - 1, size, [...acc, i]);
};

/**
 * Generate Fenwick Tree indices for prefix sum query.
 * Yields indices from idx down to 1, decrementing by lowest set bit.
 */
const generatePrefixIndices = (idx: number, acc: number[] = []): number[] => {
  if (idx <= 0) {
    return acc;
  }
  return generatePrefixIndices(idx - (idx & -idx), [...acc, idx]);
};

/**
 * Apply delta to tree at Fenwick indices.
 */
const applyTreeUpdate = (
  tree: number[],
  indices: number[],
  delta: number
): void => {
  indices.forEach((i) => {
    tree[i] += delta;
  });
};

/**
 * Create a Segment Tree (Fenwick Tree) for efficient range sum queries.
 */
export const createSegmentTree = (initialValues: number[] = []): SegmentTree => {
  const state: MutableState = {
    size: initialValues.length,
    values: [...initialValues],
    tree: new Array(initialValues.length + 1).fill(0) as number[],
  };

  const updateTree = (index: number, delta: number): void => {
    const indices = generateUpdateIndices(index, state.size);
    applyTreeUpdate(state.tree, indices, delta);
  };

  // Build the tree
  initialValues.forEach((value, i) => {
    updateTree(i, value);
  });

  const get = (index: number): number => {
    if (index < 0 || index >= state.size) {
      return 0;
    }
    return state.values[index];
  };

  const update = (index: number, value: number): void => {
    if (index < 0 || index >= state.size) {
      return;
    }
    const delta = value - state.values[index];
    state.values[index] = value;
    updateTree(index, delta);
  };

  const prefixSum = (endIndex: number): number => {
    if (endIndex <= 0) {
      return 0;
    }
    const idx = Math.min(endIndex, state.size);
    const indices = generatePrefixIndices(idx);
    return indices.reduce((sum, i) => sum + state.tree[i], 0);
  };

  const rangeSum = (startIndex: number, endIndex: number): number => {
    return prefixSum(endIndex) - prefixSum(startIndex);
  };

  const findIndexByOffset = (targetOffset: number): number => {
    if (targetOffset <= 0) {
      return 0;
    }

    const totalSum = prefixSum(state.size);
    if (targetOffset >= totalSum) {
      return state.size;
    }

    const selectNextRange = (sum: number, target: number, mid: number, left: number, right: number) =>
      sum <= target ? { left: mid + 1, right } : { left, right: mid };

    const binarySearch = (left: number, right: number): number => {
      if (left >= right) {
        return left;
      }
      const mid = Math.floor((left + right) / 2);
      const sum = prefixSum(mid + 1);
      const next = selectNextRange(sum, targetOffset, mid, left, right);
      return binarySearch(next.left, next.right);
    };

    return binarySearch(0, state.size);
  };

  const rebuildTree = (): void => {
    state.tree = new Array(state.size + 1).fill(0) as number[];
    state.values.forEach((value, i) => {
      updateTree(i, value);
    });
  };

  const resize = (newSize: number, defaultValue: number = 0): void => {
    if (newSize <= state.size) {
      state.size = newSize;
      state.values = state.values.slice(0, newSize);
      rebuildTree();
    } else {
      const extension = Array.from(
        { length: newSize - state.size },
        () => defaultValue
      );
      state.values = [...state.values, ...extension];
      state.size = newSize;
      rebuildTree();
    }
  };

  return {
    get,
    update,
    prefixSum,
    rangeSum,
    findIndexByOffset,
    resize,
    get total() {
      return prefixSum(state.size);
    },
    get length() {
      return state.size;
    },
  };
};

/**
 * @deprecated Use createSegmentTree instead. This class export is for backwards compatibility.
 */
export const SegmentTree = {
  create: createSegmentTree,
};
