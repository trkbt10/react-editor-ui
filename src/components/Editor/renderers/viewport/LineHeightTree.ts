/**
 * @file Line Height Tree
 *
 * Fenwick Tree (Binary Indexed Tree) for efficient line height management.
 * Supports O(log n) updates and O(log n) prefix sum queries.
 * Ported from LogViewer/SegmentTree.ts with line-specific adaptations.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * Line Height Tree type for cumulative height calculations.
 */
export type LineHeightTree = {
  /** Get the height of a specific line */
  readonly get: (lineIndex: number) => number;
  /** Update the height of a specific line - O(log n) */
  readonly update: (lineIndex: number, height: number) => void;
  /** Get the cumulative height from line 0 to lineIndex (exclusive) - O(log n) */
  readonly prefixSum: (lineIndex: number) => number;
  /** Get the height sum in range [startIndex, endIndex) - O(log n) */
  readonly rangeSum: (startIndex: number, endIndex: number) => number;
  /** Find the line index at a given Y offset - O(log² n) */
  readonly findLineByOffset: (yOffset: number) => number;
  /** Resize the tree to accommodate more lines */
  readonly resize: (newSize: number, defaultHeight?: number) => void;
  /** Get the total height of all lines */
  readonly totalHeight: number;
  /** Get the number of lines */
  readonly lineCount: number;
  /** Version number (incremented on updates, for cache invalidation) */
  readonly version: number;
};

type MutableState = {
  tree: number[];
  values: number[];
  size: number;
  version: number;
};

// =============================================================================
// Helper Functions
// =============================================================================

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

// =============================================================================
// Factory
// =============================================================================

/**
 * Create a Line Height Tree for efficient height queries.
 *
 * @param lineCount - Initial number of lines
 * @param defaultHeight - Default height for each line
 * @returns LineHeightTree instance
 *
 * @example
 * ```typescript
 * const tree = createLineHeightTree(1000, 21);
 * tree.update(5, 42); // Line 5 has height 42
 * const y = tree.prefixSum(5); // Y position of line 5
 * const lineAt = tree.findLineByOffset(100); // Line at Y=100
 * ```
 */
export const createLineHeightTree = (
  lineCount: number,
  defaultHeight: number
): LineHeightTree => {
  const initialValues = Array.from({ length: lineCount }, () => defaultHeight);

  const state: MutableState = {
    size: lineCount,
    values: initialValues,
    tree: new Array(lineCount + 1).fill(0) as number[],
    version: 0,
  };

  const updateTree = (index: number, delta: number): void => {
    const indices = generateUpdateIndices(index, state.size);
    applyTreeUpdate(state.tree, indices, delta);
  };

  // Build the tree
  initialValues.forEach((value, i) => {
    updateTree(i, value);
  });

  const get = (lineIndex: number): number => {
    if (lineIndex < 0 || lineIndex >= state.size) {
      return 0;
    }
    return state.values[lineIndex];
  };

  const update = (lineIndex: number, height: number): void => {
    if (lineIndex < 0 || lineIndex >= state.size) {
      return;
    }
    const delta = height - state.values[lineIndex];
    if (Math.abs(delta) < 0.5) {
      // Ignore small changes to prevent layout thrashing
      return;
    }
    state.values[lineIndex] = height;
    updateTree(lineIndex, delta);
    state.version++;
  };

  const prefixSum = (lineIndex: number): number => {
    if (lineIndex <= 0) {
      return 0;
    }
    const idx = Math.min(lineIndex, state.size);
    const indices = generatePrefixIndices(idx);
    return indices.reduce((sum, i) => sum + state.tree[i], 0);
  };

  const rangeSum = (startIndex: number, endIndex: number): number => {
    return prefixSum(endIndex) - prefixSum(startIndex);
  };

  const findLineByOffset = (yOffset: number): number => {
    if (yOffset <= 0) {
      return 0;
    }

    const totalSum = prefixSum(state.size);
    if (yOffset >= totalSum) {
      return state.size;
    }

    const selectNextRange = (
      sum: number,
      target: number,
      mid: number,
      left: number,
      right: number
    ) => (sum <= target ? { left: mid + 1, right } : { left, right: mid });

    const binarySearch = (left: number, right: number): number => {
      if (left >= right) {
        return left;
      }
      const mid = Math.floor((left + right) / 2);
      const sum = prefixSum(mid + 1);
      const next = selectNextRange(sum, yOffset, mid, left, right);
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

  const resize = (newSize: number, defaultHeight: number = 21): void => {
    if (newSize <= state.size) {
      state.size = newSize;
      state.values = state.values.slice(0, newSize);
      rebuildTree();
    } else {
      const extension = Array.from(
        { length: newSize - state.size },
        () => defaultHeight
      );
      state.values = [...state.values, ...extension];
      state.size = newSize;
      rebuildTree();
    }
    state.version++;
  };

  return {
    get,
    update,
    prefixSum,
    rangeSum,
    findLineByOffset,
    resize,
    get totalHeight() {
      return prefixSum(state.size);
    },
    get lineCount() {
      return state.size;
    },
    get version() {
      return state.version;
    },
  };
};
